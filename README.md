
# SQL Dialect Converter
**An intuitive tool for converting SQL code between different databases with visual hints**

**[Try Online Free](https://my-app-next-mysql.vercel.app/)** | **[Source code](https://github.com/Ivan0705/my-app-next-mysql)**

---

## Hello!
My name is **Ivan Vishnevskiy**. I'm the developer of this tool.

I created it because my acquaintances faced database migration issues, and I wanted to make this process simpler and more visual.

Currently, this is my pet project that I'm building with passion. It doesn't have users yet and isn't generating revenue — but it has potential.

---

## 🎯 Why I'm Sharing This
I'm exploring my path and open to different opportunities:

🔍 **Looking for like-minded people** — to develop the project further together

💡 **Open to ideas** — on how to make this tool useful for people

🤝 **Want to find a co-founder** — who complements me in areas I'm not skilled in (marketing, sales, business)

💼 **Considering job offers** — if my code and approach resonate with you

If any of this resonates with you — let's just talk. No obligations, no pretense.

## 💼 Why This Might Be Interesting for Partnership
|       What I Offer	        |    What I'm Looking for in a Partner
|-------------------------------|--------------------------------------|
| Ready working product	        |  Experience in marketing and sales
| Clean code (React + Python)	|  Monetization ideas
| Intuitive UI/UX	            |  Access to international market
| Technical expertise	        |  Desire to grow a business
| Openness to ideas	            |  Energy and drive

**Partnership format**: Discussed individually (50/50 or other options)

---

## 📫 Contact Me
- 📧 **Email**: [vipanda569@mail.ru]
- 💬 **Telegram**: [@IvanCherry0705] (fastest response here)
- 📱 **WhatsApp**: +7(953) 806-95-39
- 🐙 **GitHub**: github.com/Ivan0705

---

## 📋 About the Product
## ⚠️ Important Limitation
**The current version only works with MySQL as the source dialect!**

This means you can only convert **from MySQL to other systems**.
In future versions, I plan to add support for other source dialects.

---

## In a Nutshell
This tool helps **convert SQL code** from **MySQL** to other systems:

- ✅ **From MySQL → to PostgreSQL**
- ✅ **From MySQL → to BigQuery**
- ✅ **From MySQL → to 5+ other systems**

**What's special:** Instead of just text replacement, the tool **shows and explains all changes**.

---

## 📖 Step-by-Step Instructions
### Step 1: Select Your Target Database
- Click the **"Target Database"** dropdown
- Choose your desired DBMS: PostgreSQL, Snowflake, BigQuery, Oracle, SQL Server, SQLite, or RedShift

### Step 2: Upload SQL File
- Click the **"Upload SQL Files"** button
- Select your `.sql` file (`.txt` files are also supported)

**After upload, you'll see:**
- ✅ **"Clear All"** red button — delete all files
- ✅ **"✕"** red button next to each file — delete specific file
- ✅ Automatic file analysis (line count, complexity)

### Step 3: Convert the File
- Click the **"Convert to [selected DBMS]"** button
- Wait for conversion to complete (usually a few seconds)

### Step 4: Save the Result
**After successful conversion, you'll see:**
- ✅ **"Save Converted File"** button — download the converted SQL
- ✅ Visual comparison — original on the left, result on the right
- ✅ Change highlighting — all modifications shown in color
- ✅ Keyword Connections — links between modified constructs

---

## Who Is This For?
### Developers
- When migrating **from MySQL** to other databases
- For preparing SQL scripts for different environments
- To understand differences between MySQL and other systems

### Data Analysts
- When transferring queries **from MySQL** to other analytics systems
- For standardizing SQL within teams
- For documenting transformations

### Teachers and Students
- For studying differences **between MySQL and other SQL systems**
- For checking homework compatibility
- For demonstrating migration scenarios

## Key Features
### 1. Visual Change Highlighting
The tool **shows what changed with colors**:
- **Red with strikethrough** — removed or unsupported
- **Green** — added in the new system
- **Peach color** — modified (e.g., `AUTO_INCREMENT` → `IDENTITY(1,1)`)
**Just hover over** any highlighted element to see an explanation.

### 2. Smart Connections (Keyword Connections)
The system automatically finds and shows connections between modified constructs:

Connections (mysql → mssql)
5 connections found

⇄ AUTO_INCREMENT → IDENTITY(1,1)
Orig line: 3 / Conv line: 3
↳ Auto-increment converted for SQL Server

### 3. Instant Download
- **One click** — get your ready-to-use SQL file
- **Automatic naming**: converted_to_postgresql.sql
- **Clean, formatted code**

## 🌐 Try It Online
### 🚀 Main Version
**[my-app-next-mysql.vercel.app](https://my-app-next-mysql.vercel.app/)**  
✨ Fastest, recommended for first try

### 🌍 Static Version
**[ivan0705.github.io/my-app-next-mysql](https://ivan0705.github.io/my-app-next-mysql/)** 
📌 Always available, runs on GitHub Pages

### 📦 Source Code
**[github.com/Ivan0705/my-app-next-mysql](https://github.com/Ivan0705/my-app-next-mysql)** 
💻 For developers, contributors, and code exploration

## Test Examples
### Quick Test Example:
```sql
-- Simple test example
CREATE TABLE customers (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Project Structure

my-app-next-mysql/
├── src/
│   ├── features/                   # Core functionality
│   │   ├── sql-converter/          # SQL conversion (MySQL → others only)
│   │   ├── sql-analysis/           # SQL analysis
│   │   └── sql-diff/               # Difference comparison
│   ├── widgets/                    # Visual components
│   │   ├── dialect-comparison/     # System comparison
│   │   ├── file-manager/           # File management (main interface)
│   │   └── sql-syntax-highlighter/ # Change highlighting
│   └── shared/                     # Shared components
├── scripts/
│   └── sqlglot/                    # Python + SQLGlot scripts
│       └── hybrid_transpiler_demo.py
└── public/
    └── sql-examples/               # SQL file examples

Command Line (for Developers)
bash
# Navigate to Python script folder
cd scripts/sqlglot

# Install dependencies
pip install sqlglot

# Run conversion
python hybrid_transpiler_demo.py convert postgres
python hybrid_transpiler_demo.py convert bigquery
What's Next?
I don't know what this project will grow into. Maybe:

A useful tool for developers

A commercial product

A portfolio piece for an interesting job

Or just remain a learning example

If you have ideas or suggestions — I'm open to dialogue.

How to Help the Project
Star it — it feels good and helps find like-minded people

Found a bug? Create an Issue on GitHub

Have an idea? Write to me, let's discuss

Want to help with code? I'd welcome Pull Requests

bash
# How to contribute
git checkout -b feature/your-idea
git commit -m 'Add your idea'
git push origin feature/your-idea
# Then open a Pull Request
License
MIT License — feel free to use, study, and modify the code.

🙏 Acknowledgments
SQLGlot — powerful SQL parser for Python

Vercel — for the excellent hosting platform

My acquaintances — for sharing their problem and inspiring the creation of this tool

Let's Connect
If you've read this far and what I'm doing resonates with you — write to me. No reason needed, just to connect.

Email: vipanda569@mail.ru

Telegram: `[@IvanCherry0705](https://t.me/IvanCherry0705)` or +7(953)-806-95-39 (fastest response here)

GitHub: github.com/Ivan0705

Try It Online →

Made with ❤️ for those facing database migrations
© 2026 Ivan Vishnevskiy

