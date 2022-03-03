const axios = require('axios');

const LEETCODE_API_ENDPOINT = 'https://leetcode.com/graphql';
const DAILY_CODING_CHALLENGE_QUERY = `
query questionOfToday {
	activeDailyCodingChallengeQuestion {
		date
		userStatus
		link
		question {
			acRate
			difficulty
			freqBar
			frontendQuestionId: questionFrontendId
			isFavor
			paidOnly: isPaidOnly
			status
			title
			titleSlug
			hasVideoSolution
			hasSolution
    		topicTags {
				name
				id
				slug
			}
		}
	}
}`

const html_title = (title) => "<p>Today's Challenge :</p><h3 style=\"text-align:center;background-color:#f2f4f6;box-sizing:border-box;padding:25px 35px;\">"+title+"</h3>" ;
const html_link = (titleSlug) => "<div style=\"text-align: center;margin: 75px auto;\"><a href=\"https://leetcode.com/problems/"+titleSlug+"/\" style=\"text-decoration:none; color:white;background-color:#2EC866;width:150px;height:40x;text-align:center;padding:15px 15px;border-radius:5px;font-weight:bold;\">Solve Challenge</a></div>" ;

function get_TodaysChallenge(){

  	const titleSlug = axios.post(LEETCODE_API_ENDPOINT, { query: DAILY_CODING_CHALLENGE_QUERY })
    .then(function (res) {
        // console.log(res);
        return res.data.data.activeDailyCodingChallengeQuestion.question.titleSlug;
        
    })
    .catch(function (err) {
        // console.log(err)
        return "combination-sum";
    })

	return titleSlug;

}

function get_QuestionByTitle(titleSlug) {

	const QuestionByTitleQuery = {
		operationName: "questionData",
		variables: {
			"titleSlug": titleSlug
		},
		query: "query questionData($titleSlug: String!) {\n  question(titleSlug: $titleSlug) {\n    questionId\n    questionFrontendId\n    boundTopicId\n    title\n    titleSlug\n    content\n    translatedTitle\n    translatedContent\n    isPaidOnly\n    difficulty\n    likes\n    dislikes\n    isLiked\n    similarQuestions\n    exampleTestcases\n    categoryTitle\n    contributors {\n      username\n      profileUrl\n      avatarUrl\n      __typename\n    }\n    topicTags {\n      name\n      slug\n      translatedName\n      __typename\n    }\n    companyTagStats\n    codeSnippets {\n      lang\n      langSlug\n      code\n      __typename\n    }\n    stats\n    hints\n    solution {\n      id\n      canSeeDetail\n      paidOnly\n      hasVideoSolution\n      paidOnlyVideo\n      __typename\n    }\n    status\n    sampleTestCase\n    metaData\n    judgerAvailable\n    judgeType\n    mysqlSchemas\n    enableRunCode\n    enableTestMode\n    enableDebugger\n    envInfo\n    libraryUrl\n    adminUrl\n    challengeQuestion {\n      id\n      date\n      incompleteChallengeCount\n      streakCount\n      type\n      __typename\n    }\n    __typename\n  }\n}\n"
	};

	const content = axios.post(LEETCODE_API_ENDPOINT, QuestionByTitleQuery)
	.then(function (res) {
		const question = res.data.data.question;
		return html_title(question.title) + question.content + html_link(question.titleSlug);
	})
	.catch((err) => {
		// console.log(err);
		return "No challenge today."
	});

	return content;

}

function leetcodeDailyChallenge(cb){

	get_TodaysChallenge().then((titleSlug) => {
		get_QuestionByTitle(titleSlug).then((content) => {
			cb(content);
		});
	});

}

module.exports = leetcodeDailyChallenge;