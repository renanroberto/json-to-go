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
        const itemsList = items.reduce((acc, curr) => `${acc}, ${curr}`)
        return `[]${findType(value[0])}{${itemsList}}`
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
  let obj

  try {
    obj = JSON.parse(json)
  } catch (e) {
    return { go: '', init: '', error: e.message }
  }

  let go = 'type Result '
  let init = 'result := Result'
  const error = null

  go += JSToGo(obj, 1)
  init += initVar(obj, 1)

  return { go, init, error }
}

// ----------------------------------- CORE ------------------------------------

class App extends Component {
  state = {
    json: '',
    go : '',
    init: '',
    error: ''
  }

  convert = (e) => {
    const { value: json } = e.target
    const { go, init, error } = JsonToGo(json)

    this.setState({ json, go, init, error })
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
    let { go, init, error } = this.state

    go = this.formatCode(go)
    init = this.formatCode(init)

    const style = {
      app: {
        display: 'flex',
        justifyContent: 'space-between'
      },
      legend: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }

    return (
      <div style={{ margin: '10px 20px' }}>
        <h1>JSON to GO</h1>
        <section style={style.legend}>
          <h2 style={{ flex: 1 }}>JSON</h2>
          <h2 style={{ flex: 1 }}>Go Struct</h2>
          <h2 style={{ flex: 1 }}>Go Variable</h2>
        </section>
        <section style={style.app}>
          <Input change={this.convert} />
          <Code>{go}</Code>
          <Code>{init}</Code>
        </section>
        <Warning error={error} />
      </div>
    )
  }
}

const Input = (props) => {
  const style = {
    container: {
      display: 'flex'
    },

    input: {
      resize: 'none',
      border: '1px solid black'
    }
  }
  return (
    <div style={style.container}>
      <textarea
        cols={50}
        rows={20}
        wrap="hard"
        style={style.input}
        onChange={props.change}
      />
    </div>
  )
}

const Code = (props) => {
  const style = {
    code: {
      minWidth: '33%',
      maxWidth: '310px',
      border: '1px solid black',
      backgroundColor: 'rgba(0, 0, 0, 0.05)'
    }
  }

  return (
    <code style={style.code}>{props.children}</code>
  )
}

const Warning = (props) => {
  const { error } = props

  if (error) {
    return (
      <div>{error}</div>
    )
  }

  return <div>Syntax OK</div>
}

export default App
