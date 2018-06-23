import React, { Component } from 'react'

// ---------------------------------- Example ----------------------------------
/*
{
  "id": 1,
  "name": "Renan Roberto da Silva",
  "languages": ["javascript", "golang"],
  "contact": {
    "email": "renanroberto1@gmail.com",
    "tel": {
      "home": "123456789",
      "work": "987654321"
    }
  }
}

type Result struct{
  ID int `json:"id"`
  Name string `json:"name"`
  Languages []string `json:"languages"`
  Contact struct{
    Email string `json:"email"`
    Tel struct{
      Home string `json:"home"`
      Work string `json:"work"`
    } `json:"tel"`
  } `json:"contact"`
}
*/
// ---------------------------------- Example ----------------------------------

// ----------------------------------- CORE ------------------------------------
function findType(value) {
  switch(typeof value) {
    case 'number':
      return 'int'
    default:
      return typeof value
  }
}

function capitalize(str) {
  if (str === 'id') return str.toUpperCase()
  return str[0].toUpperCase() + str.slice(1)
}

function JSToGo(obj, level) {
  let go = 'struct {\n'

  const tab = '\t'.repeat(level)

  for(let key in obj) {
    const value = obj[key]

    if (typeof value !== 'object') {
      go += `${tab}${capitalize(key)} ${findType(value)} \`json:"${key}"\`\n`
    } else if (Array.isArray(value)) {
      go += `${tab}${capitalize(key)} []${findType(value[0])} \`json:"${key}"\`\n`
    } else {
      go += `${tab}${capitalize(key)} ${JSToGo(value, level + 1)}${tab} \`json:"${key}"\`\n`
    }
  }

  go += '}'

  return go
}

function JsonToGo(json) {
  const obj = JSON.parse(json)

  let go = 'type Result '

  go += JSToGo(obj, 1)

  return go
}
// ----------------------------------- CORE ------------------------------------

class App extends Component {
  state = {
    json: '',
    go : ''
  }

  getInput = (e) => {
    const { value } = e.target

    this.setState({ json: value })
  }

  sendInput = () => {
    const { json } = this.state

    const go = JsonToGo(json)

    this.setState({ go })
  }

  formatCode(code) {
    return code.split('\n').map((line, index) => {
      const key = index + ' - ' + line

      const tab = (key) => <span key={key}> &nbsp; </span>

      const match = line.match(/\t/g)
      const tabs = match ? match.map((v, i) => tab(v+i)) : ''

      return <div key={key}>{tabs}{line}</div>
    })
  }

  render() {
    const { go } = this.state
    const code = this.formatCode(go)

    return (
      <div>
        <h1>JSON to GO</h1>
        <textarea onChange={this.getInput}/>
        <div>{code}</div>
        <button onClick={this.sendInput}>Traduzir</button>
      </div>
    )
  }
}

export default App
