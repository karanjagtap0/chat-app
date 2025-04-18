// public/navbar.js

async function loadNavbar() {
    // Add custom styles for the navbar
    const style = document.createElement('style');
    style.innerHTML = `
        /* Navbar Styles */
        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #2c3e50;
            padding: 15px 30px;
            color: white;
            font-family: 'Arial', sans-serif;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            position: sticky;
            top: 0;
            z-index: 1000;
            width: 100%;
        }

        .navbar a {
            color: white;
            text-decoration: none;
            margin-left: 20px;
            font-weight: bold;
            transition: color 0.3s ease, transform 0.2s ease;
        }

        .navbar a:hover {
            color: #3498db;
            transform: translateY(-2px);
        }

        .navbar button {
            background-color: #e74c3c;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 25px;
            margin-left: 20px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .navbar button:hover {
            background-color: #c0392b;
            transform: translateY(-2px);
        }

        .navbar .left,
        .navbar .right {
            display: flex;
            align-items: center;
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .navbar {
                flex-direction: column;
                padding: 10px 20px;
            }

            .navbar a {
                margin-left: 0;
                margin-bottom: 10px;
            }

            .navbar button {
                margin-left: 0;
                margin-top: 10px;
            }
        }
    `;
    document.head.appendChild(style);

    // Create navbar structure
    const nav = document.createElement('div');
    nav.className = 'navbar';

    const left = document.createElement('div');
    left.className = 'left';
    left.innerHTML = `<a href="/">Home</a>`;

    const right = document.createElement('div');
    right.className = 'right';

    try {
        // Fetch user data from /api/me endpoint
        const res = await fetch('/api/me', {
            credentials: 'include'  // Send cookies with the request
        });

        if (res.ok) {
            // Successfully received user data
            const data = await res.json();
            
            right.innerHTML = `
                <span>Hello, ${data.user.username}</span>
                <a href="/">Chat</a>
                <button onclick="logout()">Logout</button>
            `;
        } else {
            // If the response is not OK, show login and register links
            throw new Error('User not logged in');
        }
    } catch (e) {
        // In case of error, show login and register links
        console.error('Error fetching user data:', e);
        right.innerHTML = `
            <a href="/login">Login</a>
            <a href="/register">Register</a>
        `;
    }

    // Append left and right sections to the navbar
    nav.appendChild(left);
    nav.appendChild(right);

    // Prepend navbar to the body
    document.body.prepend(nav);
}

function logout() {
    // Send logout request to backend
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'  // Send cookies with the request
    }).then(() => {
        // Redirect to login page after logout
        window.location.href = '/login';
    });
}

// Load the navbar when the page is loaded
document.addEventListener('DOMContentLoaded', loadNavbar);
