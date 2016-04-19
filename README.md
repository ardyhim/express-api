#**Express Api**

#***dependencies***
 1. express
 2. express-validator
 3. jsonwebtoken
 4. mongoose
 5. md5
 6. body-parser
 7. cookie-parser
 8. debug
 9. jade
 10. morgan
 11. serve-favicon

#**router**

    {
    register: {
      method: POST,
      url   : 'http://localhost:3000/api/register'
    },
    login: {
      method: POST,
      url   : 'http://localhost:3000/api/authenticate'
    },
    users: {
      method: GET,
      url   : 'http://localhost:3000/api/users/:username'
    },
    article_add: {
      method: POST,
      url   : 'http://localhost:3000/api/article'
    },
    article_list: {
      method: GET,
      url   : 'http://localhost:3000/api/article'
    },
    article_most_vote: {
      method: GET,
      url   : 'http://localhost:3000/api/article/most/vote'
    },
    article_last: {
      method: GET,
      url   : 'http://localhost:3000/api/article/most/comment'
    },
    article_most_comment: {
      method: GET,
      url   : 'http://localhost:3000/api/article/last'
    },
    article_read: {
      method: GET,
      url   : 'http://localhost:3000/api/article/read/:id'
    },
    article_delete: {
      method: DELETE,
      url   : 'http://localhost:3000/api/article/delete/:id'
    },
    article_update: {
      method: PUT,
      url   : 'http://localhost:3000/api/article/update/:id'
    },
    article_post_comment: {
      method: GET,
      url   : 'http://localhost:3000/api/article/read/:id/comment'
    },
    article_vote: {
      method: GET,
      url   : 'http://localhost:3000/api/article/vote/:id'
    }
	}
