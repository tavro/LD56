const mailObj = {
	mail1: {
		email: "noreply@tinylabs.org",
		sender: "Tiny Labs",
		topic: "An exiting new start!",
		content: `<div>
    <h2>Hello Mr. Doctor,</h2>
    <p>Thank you for participating in this exciting new venture into the future of <strong>bio-chemistry</strong>!</p>
    <p>As we have already discussed over the phone, you can now begin feeding the organism. The required materials for developing the organism have been sent and should have already arrived. Here are the next steps:</p>
    <ol>
        <li><strong>Use the DNA Modificator:</strong> Place the given part onto the organism using your DNA Modificator device.</li>
        <li><strong>Test the organism’s functionality:</strong> To confirm the process works, the organism should now be able to consume food. Test the organism’s ability to consume food using the microscope.</li>
    </ol>
    <p>Best regards,</p>
    <p><strong>Milo</strong><br>CEO of Tiny Labs</p>
    </div>
    `,
		timestamp: "13:37",
		category: "primary",
		read: false,
		favorite: false,
		important: true,
    assignments: [
      {
        title: "Attach Mouth",
        amount: 1,
        condition: function(mouthAmount) { return mouthAmount == 1; },
        completed: false
      },
      {
        title: "Eat food",
        amount: 10,
        condition: function(foodAmount) { return foodAmount == 10; },
        completed: false
      },
    ]
	},
};
