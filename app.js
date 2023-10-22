const http = require("http");
const fs = require("fs");
const bcrypt = require("bcrypt");

const port = 3000;

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <form method="POST" action="/register">
        <label for="name">Name:</label>
        <input type="text" name="name" required><br>
        <label for="email">Email:</label>
        <input type="email" name="email" required><br>
        <label for="password">Password:</label>
        <input type="password" name="password" required><br>
        <button type="submit">Register</button>
      </form>
    `);
  } else if (req.method === "POST" && req.url === "/register") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      const { name, email, password } = parseFormData(body);

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = {
        name,
        email,
        password: hashedPassword,
      };

      fs.readFile("users.json", (err, data) => {
        const users = JSON.parse(data);
        users.push(user);
        fs.writeFile("users.json", JSON.stringify(users), (err) => {
          if (err) {
            sendResponse(res, 500, "Internal Server Error");
          } else {
            sendResponse(res, 200, "Registration successful!");
          }
        });
      });
    });
  } else {
    sendResponse(res, 404, "Not Found");
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

function sendResponse(res, status, message) {
  res.writeHead(status, { "Content-Type": "text/plain" });
  res.end(message);
}

function parseFormData(body) {
  const data = {};
  const keyValuePairs = body.split("&");
  for (const pair of keyValuePairs) {
    const [key, value] = pair.split("=");
    data[key] = decodeURIComponent(value);
  }
  return data;
}
