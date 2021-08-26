const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const usernameAlreadyExists = users.find(user => {
    return user.username === username
  })

  if(!usernameAlreadyExists)
    return response.status(404).json({ error: "User not found!"})

  request.user = usernameAlreadyExists

  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const usernameAlreadyExists = users.find(user => {
    return user.username === username
  })

  if(usernameAlreadyExists)
    return response.status(400).json({ error: "User already exists!"})


  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body

  const { user } = request

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { id } = request.params

  const { user } = request

  const findTodoUser = user.todos.find(todo => {
    return todo.id === id
  })

  if(!findTodoUser)
    return response.status(404).json({ error: 'Todo not found! '})

  findTodoUser.title = title
  findTodoUser.deadline = new Date(deadline)

  return response.status(200).json(findTodoUser)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const findTodoUser = user.todos.find(todo => {
    return todo.id === id
  })

  if(!findTodoUser)
    return response.status(404).json({ error: 'todo not found !' })

  findTodoUser.done = true

  return response.status(200).json(findTodoUser)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params

  const { user } = request

  const findTodoUser = user.todos.find(todo => {
    return todo.id === id
  })

  if(!findTodoUser)
    return response.status(404).json({ error: 'todo not found !' })


  user.todos.splice(findTodoUser, 1)

  return response.status(204).send()
});

module.exports = app;