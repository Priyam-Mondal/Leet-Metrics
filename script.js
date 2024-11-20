document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-card");
    
    function validateUsername(username){
        if(username.trim() === ""){
            alert("Username should not be empty");
            return false;
        }
        //regex for leetcode username standard matching
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if(!isMatching){
            alert("Invalid Username");
        }
        return isMatching;
    }

    //api call to fetch user details
    async function fetchUserDetails(username) {
        
        try{

            //after user click on search button it should be disabled,
            //and display text 'searching...
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;

            //reset data of previous search
            resetUI();

            //call and fetch user details

            //leetcode will block request from our local machine
            //so using proxy url
            const proxyUrl = "https://cors-anywhere.herokuapp.com/";
            const targetUrl = "https://leetcode.com/graphql/";
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");
            
            const graphql = JSON.stringify({
                query: "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { "username": `${username}`}
            });
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            //call and fetch
            const response = await fetch(proxyUrl+targetUrl, requestOptions);

            if(!response.ok){
                throw new Error("Unable to fetch the user details");
            }
            const parsedData = await response.json();
            console.log("Logging data: ", parsedData);

            displayUserData(parsedData);
        }
        catch(error){
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    //display user data
    function displayUserData(parsedData){
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count; 

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyTotalQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedMediumTotalQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        //display cards
        const cardsData = [
            {label: "Overall Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions},
            {label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions},
            {label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions},
            {label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions},
        ];

        console.log("card data: ", cardsData);

        cardStatsContainer.innerHTML = cardsData.map(
            data => 
                `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                </div> `
        ).join("");
    }

    // Reset the UI before fetching new data
    function resetUI() {
        // Reset progress circles
        easyProgressCircle.style.setProperty("--progress-degree", `0%`);
        mediumProgressCircle.style.setProperty("--progress-degree", `0%`);
        hardProgressCircle.style.setProperty("--progress-degree", `0%`);
        easyLabel.textContent = "0/0";
        mediumLabel.textContent = "0/0";
        hardLabel.textContent = "0/0";

        // Hide or clear stats
        cardStatsContainer.innerHTML = "";
    }

    searchButton.addEventListener('click', function() {
        const username = usernameInput.value;
        //console.log("logging username: ", username);
        if(validateUsername(username)){
            fetchUserDetails(username);
        }
    })
})