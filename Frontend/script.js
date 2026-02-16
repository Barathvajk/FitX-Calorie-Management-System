const API_URL = 'http://localhost:5000/api';

// ---------- REGISTER ----------
const registerForm = document.getElementById('registerForm');
if(registerForm){
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            age: Number(document.getElementById('age').value),
            height: Number(document.getElementById('height').value),
            weight: Number(document.getElementById('weight').value),
            activity_level: parseFloat(document.getElementById('activity_level').value)
        };
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        alert(result.message);
        if(res.status === 201) window.location = 'login.html';
    });
}

// ---------- LOGIN ----------
const loginForm = document.getElementById('loginForm');
if(loginForm){
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if(res.status === 200){
            localStorage.setItem('token', result.token);
            window.location = 'index.html';
        } else {
            alert(result.message);
        }
    });
}

// ---------- LOGOUT ----------
function logout(){
    localStorage.removeItem('token');
    window.location = 'login.html';
}

// ---------- MEAL FORM ----------
const mealForm = document.getElementById('mealForm');
if(mealForm){
    mealForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const meal = {
            meal_name: document.getElementById('meal-name').value,
            calories: Number(document.getElementById('calories').value)
        };
        const res = await fetch(`${API_URL}/meals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(meal)
        });
        const result = await res.json();
        alert(result.message);
        document.getElementById('meal-name').value = '';
        document.getElementById('calories').value = '';
        fetchSummary();
    });
}

// ---------- FETCH SUMMARY ----------
async function fetchSummary(){
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById('totalCalories').innerText = data.totalCalories;
    document.getElementById('remainingCalories').innerText = data.remainingCalories;
    document.getElementById('goalCalories').innerText = data.goalCalories;
}

// Fetch summary on page load
if(document.getElementById('summary')) fetchSummary();
