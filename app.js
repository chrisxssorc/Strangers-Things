// The Base URL for the Strangers Things API
const BASE_URL = "https://strangers-things.herokuapp.com/api/2102-CPU-RM-WEB-PT"

// The initial state for the posts and user
let state = {
    posts: [],
    me: null
}

// Fetches posts from the API
async function fetchPosts(){
    const response = await fetch(`${BASE_URL}/posts`)
    const data = await response.json()
    return data.data.posts
}

// Fetches the authenticated user's info from the API
const fetchMe = async () => {
    const token = JSON.parse(localStorage.getItem("token"))
    try {
        const response = await fetch(`${BASE_URL}/users/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        const data = await response.json()
        return data.data
    } catch(error){
        console.error(error)
    }
}

// Renders a post with features for unauthenticated users
function unauthRenderPost(post){
    let postElement = $(`
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-date">${post.createdAt.substring(0,10)}</p>
            <h5>${post.price}</h5>
            <h6 class="card-author-info">Posted by ${post.author.username} | Location - ${post.location}</h6>
            <div class="text-area">
                <p class="card-text">${post.description}</p>
            </div>
            <div class="interact-buttons">
                <a href="#" class="btn btn-success">Purchase</a>
            </div>
    </div>`)
    postElement.data('post', post)
    return postElement
}

// Appends posts to page for unauthenticated users
function unauthRenderAllPosts(posts){
    $('#app #posts').empty()
    posts.forEach(function(post){
        $('#app #posts').append(unauthRenderPost(post))
    })
}

// Renders a post with features for authenticated users
function renderPost(post, me){
    let postElement = $(`
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-date">${post.createdAt.substring(0,10)}</p>
            <h5>${post.price}</h5>
            <h6 class="card-author-info">Posted by ${post.author.username} | Location - ${post.location}</h6>
            <div class="text-area">
                <p class="card-text">${post.description}</p>
            </div>
            ${post.author._id === me._id 
                ? `<div class="interact-buttons">
                <button id="see-message-button" class="btn btn-info" type="button">
                    See Messages
                </button>
                </div>`
                : `<div class="interact-buttons">
                <a href="#" class="btn btn-success">Purchase</a>
                </div>`
            }
            ${post.author._id === me._id 
                ? `<div class="control-buttons">
                <button type="submit" class="btn btn-danger btn-sm">Edit Post</button>
                <button id="delete-button" type="submit" class="btn btn-danger btn-sm">Delete Post</button>
                <div>`
                : ''
            }
            ${post.author._id === me._id
                ? ""
                : `<form id="new-message-form">
                <div class="mb-3">
                    <input type="text" class="form-control" id="message" placeholder="New Message..." required>
                    <button type="submit" class="btn btn-primary" id="send-message-button">Send</button>
                </div>
                </form>`
            }
        </div>
    </div>
    `)
    if (post.author._id === me._id){
        postElement.data('me', me)
    }
    postElement.data('post', post)
    return postElement
}

// Appends posts to page for authenticated users
function renderAllPosts(posts, me){
    $('#app #posts').empty()
    posts.forEach(function(post){
        $('#app #posts').append(renderPost(post, me))
    })
}

// Sends a username and password to API to register a new user
const registerUser = async (usernameValue, passwordValue) => {
    try {
        const response = await fetch(`${BASE_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user:{
                    username: usernameValue,
                    password: passwordValue
                }
            }),
        })
        const {data: {token}} = await response.json()
        
        localStorage.setItem("token", JSON.stringify(token))

        hideForms()
        state.posts = await fetchPosts()
        state.me = await fetchMe()
        renderAllPosts(state.posts, state.me)
    } catch (error){
        console.error(error)
    }
}

// Sends existing username and password to API to log in user
const loginUser = async (usernameValue, passwordValue) => {
    try{
        const response = await fetch(`${BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user:{
                    username: usernameValue, 
                    password: passwordValue
                }
            }),
        })
        const {data: {token}} = await response.json()
        
        localStorage.setItem("token", JSON.stringify(token))

        hideForms()
        state.posts = await fetchPosts()
        state.me = await fetchMe()
        renderAllPosts(state.posts, state.me)
    } catch (error){
        console.error(error)
    }
}

// Submit listener for the register form
$(".register form").on("submit", (event) => {
    event.preventDefault()
    const username = $("#registerInputUsername").val()
    const password = $("#registerInputPassword").val()

    registerUser(username, password)
    $('#post-entry').removeClass('hidden')
})

// Submit listener for the login form
$(".login form").on("submit", (event) => {
    event.preventDefault()
    const username = $("#loginInputUsername").val()
    const password = $("#loginInputPassword").val()

    loginUser(username, password)
    $('#post-entry').removeClass('hidden')
})

// Hides the register and login forms
const hideForms = () => {
    const token = JSON.parse(localStorage.getItem("token"))
    if (token){
        $("#user-forms").css("display", "none")
    }
}

// Sends a new post to the API and renders the new post to the page
const postNewEntry = async (postTitle, postDescription, postPrice) => {
    const token = JSON.parse(localStorage.getItem("token"))
    if (token) {
        try {
            const response = await fetch(`${BASE_URL}/posts`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    post: {
                        title: postTitle,
                        description: postDescription,
                        price: postPrice,
                        willDeliver: true
                    }
                })
            })
        } catch (error) {
            console.error(error)
        } finally {
            state.posts = await fetchPosts()
            state.me = await fetchMe()
            renderAllPosts(state.posts, state.me)
        }
    }
}

// Submit listener for the new post form
$("#new-post-form").on("submit", (event) => {
    event.preventDefault()

    const title = $("#title").val()
    const description = $("#description").val()
    const price = $("#price").val()

    postNewEntry(title, description, price)

    $("#title").val('')
    $("#description").val('')
    $("#price").val('')
})

// Checks if search term is in a post title, author, or description
const postMatches = (post, searchTerm) => {
    return post.title.includes(searchTerm) || post.author.username.includes(searchTerm) || post.description.includes(searchTerm)
}

// Submit listener for the search term form
$('#search-form').on('submit', function(event){
    event.preventDefault()

    let searchTerm = $('#search-bar').val()

    let filteredPosts = state.posts.filter(post => postMatches(post, searchTerm))
    
    if (state.me !== null){
        renderAllPosts(filteredPosts, state.me)
    } else {
        unauthRenderAllPosts(filteredPosts)
    }

    $('#clear-search-button').removeClass('hidden')
})

// Click listener for the clear search term button
$('#app').on('click', '#clear-search-button', function(event){
    event.preventDefault()

    if (state.me !== null){
        renderAllPosts(state.posts, state.me)
    } else {
        unauthRenderAllPosts(state.posts)
    }

    $('#clear-search-button').addClass('hidden')
    $('#search-bar').val('')
})

// Renders a message from a post
const renderMessage = (message) => {
    let messageElement = $(`
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">${message.fromUser.username}</h5>
            <p class="card-date">${message.content}</p>
        </div>
    </div>
    `)
    messageElement.data('message', message)
    return messageElement
}

// Appends messages to the message board on the page
const renderAllMessages = (messages, postTitle) => {
    $('#message-board .message-list').empty()
    $('#message-board .message-list').append(`<h4>Messages from your post</h4>`)
    $('#message-board .message-list').append(`<h4>"${postTitle}"</h4>`)
    messages.forEach((message) => {
        $('#message-board .message-list').append(renderMessage(message))
    })
}

// Click listener for the see messages button
$('#app').on('click', '#see-message-button', function (event) {
    event.preventDefault()

    const postElement = $(this).closest('.card')
    const post = postElement.data('post')
    const me = postElement.data('me')
    const postId = post._id
    const postTitle = post.title
    const allMessages = me.messages
    
    let postMessages = []
    allMessages.forEach(message => {
        if(message.post._id === postId){
            postMessages.push(message)
        }
    })
    
    renderAllMessages(postMessages, postTitle)
})

// Sends a new message for a post to the API
const postNewMessage = async (postId, newMessage) => {
    const token = JSON.parse(localStorage.getItem("token"))
    if (token) {
        try {
            const response = await fetch(`${BASE_URL}/posts/${postId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: {
                        content: newMessage,
                    }
                })
            })
            const message = await response.json()
            console.log(message)
        } catch (error) {
            console.error(error)
        }
    }
}

// Click listener for the send message button
$('#app').on('click', '#send-message-button', function (event) {
    event.preventDefault()

    const postElement = $(this).closest('.card')
    const post = postElement.data('post')
    const postId = post._id

    const newMessage = postElement.find('#message').val()

    postNewMessage(postId, newMessage)

    $(this).trigger('reset')
})

// Sends a request to the API to delete a post
const deleteBlogEntry = async (postId) => {
    const token = JSON.parse(localStorage.getItem("token"))
	try {
		const request = await fetch(`${BASE_URL}/posts/${postId}`, {
			method: "DELETE", 
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			}
		})
	} catch(error) {
		console.error(error)
	} finally {
        state.posts = await fetchPosts()
        state.me = await fetchMe()
        renderAllPosts(state.posts, state.me)
    }
}

// Click listener for the delete button
$('#app').on('click', '#delete-button', function (event){
    event.preventDefault()

    const postElement = $(this).closest('.card')
    const post = postElement.data('post')
    const postId = post._id

    deleteBlogEntry(postId)
})

// Calls all functions to render the page when a user first visits
const bootstrap = async () => {
    hideForms()
    try {
        state.posts = await fetchPosts()
        state.me = await fetchMe()
        renderAllPosts(state.posts, state.me)
        $('#post-entry').removeClass('hidden')
    } catch {
        state.posts = await fetchPosts()
        unauthRenderAllPosts(state.posts)
    }
}

bootstrap()