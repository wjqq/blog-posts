# blog-posts

Repo for blog posts and examples


知识点
1 - 使用ngrok穿透网络，/ngrok http 3000
2 - 使用foreman，访问环境变量 ng start

总结
1 -  开始没有注意，用code交换token使用了https://slack.com/api/oauth.access，导致错误 {"ok":false,"error":"oauth_authorization_url_mismatch"}

2 - Bot token是workspace级别的，用户授权完毕，需要save到一个db或者一个安全的地方,有了这个token，这个app就可以与不同的workspace进行交互了。

3 - 如果app需要on behalf of 用户，则需要用户权限，处理方式没有什么不同，只是授权返回的信息中多了user的token，这样就可以代替user发信息等等，需要根据具体的scope.

	"authed_user": {
		"id": "UV73RE6RK",
		"scope": "chat:write",
		"access_token": "xoxp-993109011440-993127482869-988848993411-ab22dbfe03a7b458b81963f87c6dc979",
		"token_type": "user"
	},

4 - workspace = team

5 - 处理前端请求，需要考虑team，不同team需要使用不同的bot token，不同的用户需要使用不同user的token，重要事情说3遍



# https://slack.com/oauth/v2/authorize + https://slack.com/api/oauth.v2.access




references:
# https://girliemac.com/blog/2016/10/24/slack-command-bot-nodejs/