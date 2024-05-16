const express = require('express')
const app = express()
const path = require('path')
const fsp = require('fs').promises
const port = 3000

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const myPath = path.join(__dirname, 'data', 'items.json')

async function writeToItemsFile(obj) {
    try {
        const data = await fsp.readFile(myPath)
        const jsonArray = JSON.parse(data)
        jsonArray.push(obj)

        let id = 0
        for (const li of jsonArray) {
          id += 1
          li.id = id
        }

        const newJson = JSON.stringify(jsonArray)
        fsp.writeFile(myPath, newJson)
        return id
      } catch (error) {
        // Handle any errors that occur during the file writing process
        console.error('Error writing to file:', error);
      }
}

async function returnJsonArray(id) {
  try {
    const data = await fsp.readFile(myPath)
    return JSON.parse(data)
  } catch (error) {
    // Handle any errors that occur during the file reading process
    console.error('Error reading file:', error);
  }
}

async function refactorItemsFile(jsonArray) {
  try {
      let newId = 0
      for (const li of jsonArray) {
        newId += 1
        li.id = newId
      }

      const newJson = JSON.stringify(jsonArray)
      fsp.writeFile(myPath, newJson)
    } catch (error) {
      // Handle any errors that occur during the file writing process
      console.error('Error writing to file:', error);
    }
}


app.route('/')
    .get((req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'))
    })
    .post(async (req, res) => {
        const id = await writeToItemsFile(req.body)
        res.send(`Your list was made. To view it, go to localhost:3000/${id}. All list id's have been refactored`)
    })


app.set('view engine', 'ejs') // this lets me dynamically render the /:id route, which I need to be able to to show different jsons with button

app.route('/:id')
  .get(async (req, res) => {
    const id = req.params.id * 1
    const jsonArray = await returnJsonArray(req.params.id)
    const json = JSON.stringify(jsonArray.find(li => li.id === id))
    res.render('id', { json: json, id: req.params.id })
  })
  .delete(async (req, res) => {
    const id = req.params.id * 1
    const jsonArray = await returnJsonArray(req.params.id)
    const jsonObj = jsonArray.find(li => li.id === id)
    const index = jsonArray.indexOf(jsonObj)
    jsonArray.splice(index, 1)

    refactorItemsFile(jsonArray)

    res.status(200).send('Deleted content')
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})