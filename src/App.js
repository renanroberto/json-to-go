import React, { Component } from 'react'

// ---------------------------------- Example ----------------------------------
/*
{
  "id": 1,
  "name": "Renan Roberto da Silva",
  "languages": ["javascript", "golang"],
  "grades": [9.8, 9.5, 8],
  "contact": {
    "email": "renanroberto1@gmail.com",
    "tel": {
      "home": "123456789",
      "work": "987654321"
    }
  },
  "active": true
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
  Active bool `json:"active"`
}

result := Result{
  ID: 1,
  Name: "Renan Roberto da Silva",
  Languages: []string{"javascript", "golang"},
  Contact: {
    Email: "renanroberto1@gmail.com",
  },
  Active: true,
}
*/
// ---------------------------------- Example ----------------------------------

// ----------------------------------- CORE ------------------------------------
function findType(value) {
  switch(typeof value) {
    case 'number':
      if (value % 1 !== 0) return 'float64'
      return 'int'
    case 'boolean':
      return 'bool'
    default:
      return typeof value
  }
}

function typeOfValue(value) {
  switch(typeof value) {
    case "number":
      return value
    case "boolean":
      return value
    case "string":
      return `"${value}"`
    case "object":
      if (Array.isArray(value)) {
        const items = value.map(typeOfValue)
        return `[]${findType(value[0])}{${items}}`
      }
      return ''
    default:
      return ''
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

function initVar(obj, level) {
  let init = '{\n'

  const tab = '\t'.repeat(level)

  for (let key in obj) {
    const value = obj[key]

    if (typeof value !== 'object' || Array.isArray(value)) {
      init += `${tab}${capitalize(key)}: ${typeOfValue(value)},\n`
    } else {
      init += `${tab}${capitalize(key)}: ${initVar(value, level + 1)},${tab}\n`
    }
  }

  init += '}'
  return init
}

function JsonToGo(json) {
  const obj = JSON.parse(json)

  let go = 'type Result '
  let init = 'result := Result'

  go += JSToGo(obj, 1)
  init += initVar(obj, 1)

  return { go, init }
}

// ----------------------------------- CORE ------------------------------------

class App extends Component {
  state = {
    json: '',
    go : '',
    init: ''
  }

  getInput = (e) => {
    const { value } = e.target

    this.setState({ json: value })
  }

  sendInput = () => {
    const { json } = this.state

    const { go, init } = JsonToGo(json)

    this.setState({ go, init })
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
    let { go, init } = this.state

    go = this.formatCode(go)
    init = this.formatCode(init)

    return (
      <div style={{ margin: '10px 20px' }}>
        <h1>JSON to GO</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <textarea
              cols={40}
              rows={13}
              onChange={this.getInput}
            />
          </div>
          <div>{go}</div>
          <div>{init}</div>
        </div>
        <button onClick={this.sendInput}>Traduzir</button>
      </div>
    )
  }
}

export default App
