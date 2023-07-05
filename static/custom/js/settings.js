
$(function(){
    document.addEventListener("keydown", function(event) {
        const textarea = document.querySelector("#message"); // Replace "message" with the ID of your textarea element
        
        if (event.ctrlKey && event.key === "Enter" && event.target === textarea) {
          event.preventDefault(); // Prevent the default form submission
          // Perform your desired action here, such as submitting the form
          // document.querySelector("form").submit();
        }
      });
});