# ShopEase 🛒  
*A Full-Stack E-Commerce Platform built with Angular, Spring Boot, Firebase & Docker*  

## 📌 Overview  
ShopEase is a responsive e-commerce web application that allows users to browse products, manage carts, and perform authentication. The platform is designed with **Angular (frontend)**, **Spring Boot (backend)**, **Firebase (authentication)**, and **Docker (containerization)** to provide a scalable, secure, and modern shopping experience.  

---

## 🚀 Features  
- 📦 Product catalog with search & filtering  
- 🛒 Shopping cart with real-time updates  
- 🔐 User authentication (login/signup with Firebase)  
- ⚡ Optimized UI with RxJS for smooth animations  
- 🌐 REST APIs with Spring Boot (backend services)  
- 📊 Session-based storage & localStorage support  
- 🐳 Dockerized setup for easy deployment  

---

## 🏗️ Tech Stack  
- **Frontend:** Angular 13, RxJS, Bootstrap  
- **Backend:** Spring Boot (Java), REST APIs  
- **Authentication:** Firebase (Login & Signup)  
- **Database:** Currently session-based & localStorage (MongoDB/SQL can be integrated)  
- **DevOps:** Docker, GitHub  

---

## 📂 Project Structure  
```
ShopEase/
│── backend/              # Spring Boot backend
│   ├── src/              # Java source files
│   └── pom.xml           # Maven configuration
│
│── frontend/             # Angular frontend
│   ├── src/              # Angular components, services, assets
│   └── angular.json      # Angular configuration
│
│── docker-compose.yml    # Docker setup for full-stack app
│── README.md             # Project documentation
```

---

## ⚙️ Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/Aditya-Dangi/ShopEase.git
cd ShopEase
```

### 2️⃣ Frontend Setup (Angular)  
```bash
cd frontend
npm install
ng serve
```
👉 Runs on `http://localhost:4200/`  

### 3️⃣ Backend Setup (Spring Boot)  
```bash
cd backend
mvn spring-boot:run
```
👉 Runs on `http://localhost:8080/`  

### 4️⃣ Docker Setup (Optional - Full Stack)  
```bash
docker-compose up --build
```

---

## 🔑 Authentication  
- User authentication is handled with **Firebase**.  
- Signup/Login functionality is available in the frontend (`auth.service.ts`).  
- Firebase configs are stored in `frontend/src/environments/`.  

---

## 📖 Documentation  
For detailed explanation of architecture, workflows, and APIs, check:  
📄 [ShopEase Documentation](./ShopEase%20App%20Documentation.pdf)  

---

## 📌 Future Enhancements  
- 🗄️ Migrate to MongoDB/SQL for persistent storage  
- 💳 Payment gateway integration  
- 📱 Mobile-responsive PWA version  
- 📊 Admin dashboard for analytics  

---

## 👨‍💻 Author  
**Aditya Singh Dangi**  
- 🌐 [Portfolio](https://adityadangi-portfolio.netlify.app)  
- 💼 [LinkedIn](https://www.linkedin.com/in/aditya-singh-dangi/)  
- 💻 [GitHub](https://github.com/Aditya-Dangi)  
