# Tutor Fit Studio – AI-Powered Trust Prototype 🧠✨

Tutor Fit Studio is a lightweight, interactive prototype designed to explore how AI can build *felt trust* between families and tutors during onboarding. It’s part of a broader exploration of how dynamic trust systems can increase conversion for high-consideration education platforms like Nerdy.

## 🧪 Prototype Purpose

- Simulates a parent swiping through short tutor videos
- Collects lightweight preference signals via swiping (👍 / 👎)
- Builds a dynamic "trust profile" based on preferred traits
- Sends them to OpenAI to generate a summary
- Displays a warm, personalized message and highlights key traits

---

## 👨‍💻 Run Locally

```bash
git clone https://github.com/your-username/tutor-fit-studio.git
cd tutor-fit-studio
npm install
```

Then add your OpenAI key to `.env`:

```env
OPENAI_API_KEY=your-api-key-here
```

Start the server:

```bash
node server.js
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 📁 Folder Structure

```
public/
  ├─ index.html
  ├─ style.css
  ├─ script.js
server.js
.env
```

---

## 🧠 Concepts Behind the Prototype

This prototype draws on ideas from:

- **Human-AI Collaboration** — Using tone and subtle UI feedback to convey emotional intelligence
- **Trust Loop Design** — Visualizing real-time feedback to make the system feel active and attuned
- **Dynamic Trait Graphs** — Matching tutors based on soft signals, not just structured filters

---

## 📚 Related Docs

This prototype is part of a broader case study you can read here:

- [📄 Tutor Fit Studio PRD](./Tutor Fit Studio Prd.pdf)
- [📄 Dynamic Trust Graph Design](./Building a Dynamic Trust Graph for Tutor Fit Studio.pdf)
- [📄 Case Study: Bridging the Trust Gap](./Completed Nerdy Product Case Study - Bridging the Trust Gap_ Increasing Conversion for Nerdy Through Active Selection.pdf)

---

## 📬 Questions?

Feel free to reach out if you're curious about the design decisions, implementation, or want to explore ideas around emotionally intelligent AI interfaces!
