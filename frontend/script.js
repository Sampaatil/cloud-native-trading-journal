// ---------- CONFIG ----------
const API_URL = "https://jccr87wdi3.execute-api.us-east-1.amazonaws.com"

let chart = null
let editTradeId = null

// ---------- AUTH HEADER ----------
function getAuthHeaders() {
  return {
    "Content-Type": "application/json",
    "Authorization": localStorage.getItem("token")
  };
}

// ---------- INIT ----------
window.onload = () => {
  let today = new Date()
  date.value = today.toISOString().split('T')[0]
  month.selectedIndex = today.getMonth()

  const token = localStorage.getItem("token")

  if (token && token !== "null" && token !== "undefined") {
    front.classList.add("hidden")
    dashboard.classList.remove("hidden")
    loadTrades()
  } else {
    front.classList.remove("hidden")
    dashboard.classList.add("hidden")
  }
}

// ---------- AUTH UI ----------
function openSignup(){
  signupBox.classList.remove("hidden")
  loginBox.classList.add("hidden")
}

function openLogin(){
  loginBox.classList.remove("hidden")
  signupBox.classList.add("hidden")
}

// ---------- SIGNUP ----------
async function signup(){
  let mobile = suMobile.value.trim()
  let pass = suPass.value.trim()

  if(!mobile || !pass){
    alert("Enter mobile and password")
    return
  }

  let res = await fetch("https://cognito-idp.us-east-1.amazonaws.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp"
    },
    body: JSON.stringify({
      ClientId: "62clkaslc7pklhafbb6n519oup",
      Username: mobile,
      Password: pass
    })
  })

  let data = await res.json()

  if(data.UserSub){
    alert("Signup successful")
    openLogin()
  } else {
    alert("Signup failed")
    console.log(data)
  }
}

// ---------- LOGIN ----------
async function login() {
  const mobile = liMobile.value.trim()
  const pass = liPass.value.trim()

  if(!mobile || !pass){
    alert("Enter credentials")
    return
  }

  const res = await fetch("https://cognito-idp.us-east-1.amazonaws.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth"
    },
    body: JSON.stringify({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: "62clkaslc7pklhafbb6n519oup",
      AuthParameters: {
        USERNAME: mobile,
        PASSWORD: pass
      }
    })
  })

  const data = await res.json()

  if (!data.AuthenticationResult) {
    alert("Login failed")
    console.log(data)
    return
  }

  // ✅ store token
  localStorage.setItem("token", data.AuthenticationResult.IdToken)

  front.classList.add("hidden")
  dashboard.classList.remove("hidden")

  loadTrades()
}

// ---------- LOGOUT ----------
function logout(){
  localStorage.removeItem("token")
  location.reload()
}

// ---------- ADD / UPDATE ----------
tradeForm.onsubmit = async e => {
  e.preventDefault()

  if(
    !date.value ||
    pair.selectedIndex === 0 ||
    !direction.value ||
    !sl.value ||
    riskfree.selectedIndex === 0 ||
    result.selectedIndex === 0 ||
    !pips.value
  ){
    alert("PLEASE FILL ALL DETAILS")
    return
  }

  let trade = {
    tradeId: editTradeId || Date.now().toString(),
    month: month.value,
    date: date.value,
    pair: pair.value,
    reason: reason.value,
    direction: direction.value,
    sl: sl.value,
    riskfree: riskfree.value,
    result: result.value,
    pips: +pips.value,
    analysis: analysis.value.trim() || ""
  }

  try {
    if(editTradeId){
      await fetch(`${API_URL}/updateTrade`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(trade)
      })
      editTradeId = null
    } else {
      await fetch(`${API_URL}/addTrade`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(trade)
      })
    }

    tradeForm.reset()
    date.value = new Date().toISOString().split('T')[0]

    loadTrades()

  } catch(err){
    console.error(err)
    alert("Error saving trade")
  }
}

// ---------- LOAD ----------
async function loadTrades(){
  try {
    let res = await fetch(`${API_URL}/getTrades?month=${month.value}`, {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    })

    let list = await res.json()

    if(!Array.isArray(list)){
      console.error(list)
      alert("Failed to load trades")
      return
    }

    rows.innerHTML = ''

    let w=0,l=0,b=0,tp=0

    list.forEach((t,i)=>{
      let p=0

      if(t.result==='TP HIT'){p=t.pips; w++}
      if(t.result==='SL HIT'){p=-t.pips; l++}
      if(t.result==='BREAKEVEN'){p=0; b++}

      tp += p

      rows.innerHTML += `
      <tr>
        <td>${i+1}</td>
        <td>${t.date}</td>
        <td>${t.pair}</td>
        <td>${t.reason}</td>
        <td>${t.direction}</td>
        <td>${t.sl}</td>
        <td>${t.riskfree}</td>
        <td>${t.result}</td>
        <td>${p}</td>
        <td>${t.analysis || ''}</td>
        <td>
          <button class="edit" onclick="editTrade('${t.tradeId}')">Edit</button>
          <button class="delete" onclick="deleteTrade('${t.tradeId}')">Delete</button>
        </td>
      </tr>`
    })

    total.innerText = tp
    accuracy.innerText = `Trade Accuracy: ${w+l ? ((w/(w+l))*100).toFixed(2) : 0}%`

    drawChart(w,l,b)

  } catch(err){
    console.error(err)
    alert("Error loading trades")
  }
}

// ---------- EDIT ----------
async function editTrade(id){
  let res = await fetch(`${API_URL}/getTrades?month=${month.value}`, {
    headers: {
      "Authorization": localStorage.getItem("token")
    }
  })

  let list = await res.json()

  let t = list.find(x => x.tradeId === id)

  editTradeId = id

  Object.keys(t).forEach(k=>{
    if(document.getElementById(k)){
      document.getElementById(k).value = t[k]
    }
  })
}

// ---------- DELETE ----------
async function deleteTrade(id){
  if(!confirm("Delete this trade?")) return

  await fetch(`${API_URL}/deleteTrade`, {
    method:"DELETE",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      tradeId: id
    })
  })

  loadTrades()
}

// ---------- CHART ----------
function drawChart(w,l,b){
  if(chart) chart.destroy()

  chart = new Chart(pie,{
    type:'pie',
    data:{
      labels:['Win','Loss','Breakeven'],
      datasets:[{
        data:[w,l,b],
        backgroundColor:['#16a34a','#dc2626','#ca8a04']
      }]
    }
  })
}