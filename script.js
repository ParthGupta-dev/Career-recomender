// Track selected interests
const selectedInterests = new Set();
const buttons = document.querySelectorAll('.interest-btn');

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const value = btn.dataset.value;
        if (selectedInterests.has(value)) {
            selectedInterests.delete(value);
            btn.classList.remove('selected');
        } else {
            selectedInterests.add(value);
            btn.classList.add('selected');
        }
    });
});

document.getElementById('recommendBtn').addEventListener('click', () => {
    if (selectedInterests.size === 0) {
        document.getElementById('result').innerText = "Please select at least one interest!";
        return;
    }

    const interests = Array.from(selectedInterests);
    let career = "No matching career found.";

    if (interests.includes("coding") && interests.includes("math")) {
        career = "Software Engineer / Data Scientist";
    } else if (interests.includes("design")) {
        career = "Graphic Designer / UX Designer";
    } else if (interests.includes("writing")) {
        career = "Content Writer / Author";
    } else if (interests.includes("business")) {
        career = "Entrepreneur / Business Analyst";
    } else if (interests.includes("math")) {
        career = "Maths Professor";
    } else if (interests.includes("ai")) {
        career = "AI / ML Engineer";
    } else if (interests.includes("finance")) {
        career = "Financial Analyst";
    } else if (interests.includes("health")) {
        career = "Healthcare Professional";
    } else if (interests.includes("law")) {
        career = "Lawyer";
    } else if (interests.includes("arts")) {
        career = "Artist / Designer";
    } else if (interests.includes("coding")) {
        career = "Software Developer";
    }

    document.getElementById('result').innerText = career;
});
