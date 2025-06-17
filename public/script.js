let tutors = [];
let currentIndex = 0;
let trustProfile = {};

let startX = 0;
let currentX = 0;
let dragging = false;

// 🧠 Load tutors and show the first one
async function loadTutors() {
  const res = await fetch("tutors.json");
  tutors = await res.json();
  showTutor();
}

// 🎬 Show the current tutor with trait tags
function showTutor() {
  if (currentIndex >= tutors.length) return;

  const tutor = tutors[currentIndex];
  const trustBar = document.getElementById("trust-bar");
  const counter = document.getElementById("tutor-counter");

  if (trustBar && tutors.length > 0) {
    const progress = ((currentIndex + 1) / tutors.length) * 100;
    trustBar.style.width = `${progress}%`;
  }

  if (counter) {
    counter.innerText = `Tutor ${currentIndex + 1} of ${tutors.length}`;
  }
  const video = document.getElementById("tutor-video");
  const fallbackImage = document.getElementById("fallback-image");
  const name = document.getElementById("tutor-name");
  const traitsContainer = document.getElementById("traits-container");
  const explanationEl = document.getElementById("explanation");
  const rationaleCard = document.getElementById("rationale-card");

  if (
    !video ||
    !fallbackImage ||
    !name ||
    !traitsContainer ||
    !explanationEl ||
    !rationaleCard
  )
    return;

  if (tutor.videoUrl && tutor.videoUrl.trim() !== "") {
    video.src = tutor.videoUrl;
    video.style.display = "block";
    fallbackImage.style.display = "none";
  } else {
    video.src = "";
    video.style.display = "none";
    fallbackImage.style.display = "block";
  }

  name.innerText = tutor.name;
  traitsContainer.innerHTML = "";
  tutor.traits.forEach((trait) => {
    const span = document.createElement("span");
    span.className = "trait-pill";
    span.innerText = trait;
    traitsContainer.appendChild(span);
  });

  explanationEl.innerText = "";
  rationaleCard.classList.remove("show");
  rationaleCard.classList.add("hidden");

  resetSwipeCardPosition();
}

// 💬 Capture swipe feedback and show rationale
function captureFeedback(liked) {
  if (currentIndex >= tutors.length) return;

  const tutor = tutors[currentIndex];
  const selectedTraits = liked ? tutor.traits : [];

  selectedTraits.forEach((trait) => {
    trustProfile[trait] = (trustProfile[trait] || 0) + (liked ? 1 : -1);
  });

  const rationaleCard = document.getElementById("rationale-card");
  const explanationEl = document.getElementById("explanation");

  if (rationaleCard && explanationEl) {
    explanationEl.innerText = liked
      ? `Parents appreciated this tutor’s ${selectedTraits.join(", ")} style.`
      : `Noted! We’ll look for tutors with less focus on ${selectedTraits.join(", ")}.`;

    rationaleCard.classList.remove("hidden");
    setTimeout(() => rationaleCard.classList.add("show"), 50);
  }

  setTimeout(() => {
    currentIndex++;

    if (currentIndex < tutors.length) {
      showTutor();
    } else {
      const card = document.getElementById("swipe-card");
      if (card) {
        card.removeEventListener("pointerdown", handlePointerDown);
        card.removeEventListener("pointermove", handlePointerMove);
        card.removeEventListener("pointerup", handlePointerUp);
        card.style.transform = "";
      }

      const app = document.getElementById("app");
      const summaryScreen = document.getElementById("summary-screen");
      const summaryMessage = document.getElementById("summary-message");
      const summarySpinner = document.getElementById("summary-spinner");
      const traitsContainer = document.getElementById("top-traits");

      if (app && summaryScreen) {
        app.style.display = "none";
        summaryScreen.classList.remove("hidden");
      }

      const entries = Object.entries(trustProfile).filter(
        ([_, score]) => score > 0,
      );
      const sortedTraits = entries
        .sort((a, b) => b[1] - a[1])
        .map((entry) => entry[0]);

      // show trait pills
      if (traitsContainer) {
        traitsContainer.innerHTML = "";
        sortedTraits.forEach((trait) => {
          const span = document.createElement("span");
          span.innerText = trait;
          traitsContainer.appendChild(span);
        });
      }

      // show spinner, hide message initially
      if (summaryMessage) summaryMessage.style.display = "none";
      if (summarySpinner) summarySpinner.style.display = "block";

      if (sortedTraits.length > 0) {
        generateTutorSummary(sortedTraits)
          .then((data) => {
            const summary = typeof data === "string" ? data : data.summary;
            const highlightedTraits = Array.isArray(data.highlightedTraits)
              ? data.highlightedTraits
              : [];

            if (summaryMessage) {
              summaryMessage.innerHTML = summary;
              summaryMessage.style.display = "block";
            }

            if (summarySpinner) summarySpinner.style.display = "none";
          })
          .catch((err) => {
            console.error("AI summary failed:", err);
            if (summaryMessage) {
              summaryMessage.innerText = `You gravitate toward tutors who are ${sortedTraits.join(", ")}.`;
              summaryMessage.style.display = "block";
            }
            if (summarySpinner) summarySpinner.style.display = "none";
          });
      } else {
        if (summaryMessage) {
          summaryMessage.innerText = `You explored a mix of tutor styles. Ready to discover your fit?`;
          summaryMessage.style.display = "block";
        }
        if (summarySpinner) summarySpinner.style.display = "none";
      }
    }
  }, 800);
}

// 🧠 Updated generateTutorSummary with highlight mapping
async function generateTutorSummary(traits) {
  traits.sort((a, b) => b.length - a.length);

  const prompt = `
You're helping a parent feel emotionally confident in the type of tutor they're drawn to.

Based on the traits below, generate a warm, friendly, one-sentence summary that:
- Focuses on the kind of tutor they’re selecting
- Hints at how this would help their child
- Uses gentle, non-salesy language
- Avoids awkward listing of traits

In your sentence, highlight up to 3 short **natural language phrases** (not individual traits) using <span class='highlight-trait'>...</span>.

❌ Do NOT just wrap the trait words (e.g. “playful”)
✅ Instead, wrap expressive fragments like “a warm, engaging presence” or “brings calm to the learning space”

Avoid awkward enumeration or reusing traits exactly. Think like a human educator reassuring a parent.

Return ONLY valid JSON like:
{
  "summary": "This is a <span class='highlight-trait'>great summary</span> example.",
  "highlightedTraits": ["calm", "relatable"]
}

Traits: ${traits.join(", ")}
`;

  const res = await fetch("/api/gpt-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const result = await res.json();
  const raw = result.choices?.[0]?.message?.content.trim();
  console.log("🔎 GPT raw output:", raw);

  try {
    const parsed = JSON.parse(raw);
    return parsed; // this includes both `summary` and `highlightedTraits`
  } catch (e) {
    console.error("⚠️ GPT response not valid JSON:", raw);
    return {
      summary: "You seem to appreciate tutors with a thoughtful, unique style.",
      highlightedTraits: [],
    };
  }
}

// 🧲 Swipe gesture logic
function handlePointerDown(e) {
  const card = document.getElementById("swipe-card");
  if (!card) return;
  startX = e.clientX;
  dragging = true;
  card.setPointerCapture(e.pointerId);
}

function handlePointerMove(e) {
  const card = document.getElementById("swipe-card");
  if (!dragging || !card) return;
  card.style.transition = "none";
  currentX = e.clientX - startX;
  card.style.transform = `translateX(${currentX}px) rotate(${currentX / 20}deg)`;
}

function handlePointerUp() {
  const card = document.getElementById("swipe-card");
  if (!card) return;
  dragging = false;
  card.style.transition = "transform 0.3s ease";

  if (currentX > 100) {
    captureFeedback(true);
  } else if (currentX < -100) {
    captureFeedback(false);
  } else {
    resetSwipeCardPosition();
  }

  currentX = 0;
}

function resetSwipeCardPosition() {
  const card = document.getElementById("swipe-card");
  if (!card || !card.style) return;
  card.style.transform = "translateX(0px) rotate(0deg)";
}

// 🚀 Onboarding entry point
document.getElementById("start-button").addEventListener("click", () => {
  document.getElementById("onboarding-modal").style.display = "none";

  const card = document.getElementById("swipe-card");
  if (card) {
    card.addEventListener("pointerdown", handlePointerDown);
    card.addEventListener("pointermove", handlePointerMove);
    card.addEventListener("pointerup", handlePointerUp);
  }

  loadTutors();
});

// Fallback buttons
document
  .getElementById("like-button")
  .addEventListener("click", () => captureFeedback(true));
document
  .getElementById("dislike-button")
  .addEventListener("click", () => captureFeedback(false));
