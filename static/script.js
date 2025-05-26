// static/script.js

document.addEventListener("DOMContentLoaded", function() {
    // Contact Supplier Form Submission
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const productName = document.getElementById("productName").value;
            const email = document.getElementById("email").value;
            const message = document.getElementById("message").value;

            fetch("/contact_supplier", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    product: productName,
                    email: email,
                    message: message
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Message sent successfully!");
                    document.getElementById("email").value = ""; //clear the form.
                    document.getElementById("message").value = ""; //clear the form.
                } else {
                    alert("Message failed to send.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("An error occurred while sending the message.");
            });
        });
    }
});
