/*
Template Name: Vhato - Responsive Bootstrap 5 Chat App
Author: Themesbrand
Version: 1.0.0
Website: https://Themesbrand.com/
Contact: Themesbrand@gmail.com
File: Main Js File
*/
// color style change
/*********
 * theme style
 * **********/

//get color

document.documentElement.style.setProperty(
  "--bs-primary-rgb",
  window.localStorage.getItem("colorPrimary")
);
document.documentElement.style.setProperty(
  "--bs-secondary-rgb",
  window.localStorage.getItem("colorSecondary")
);

function themeColor(primaryColor) {
  var activeCustomcolor = localStorage.getItem("activeCustomcolor");
  if (activeCustomcolor) {
    document.getElementById(activeCustomcolor).checked = true;
  }
  document.querySelectorAll(".theme-color").forEach(function (item) {
    var colorRadioElements = document.querySelector(
      "input[name=bgcolor-radio]:checked"
    );

    if (colorRadioElements) {
      colorRadioElements = colorRadioElements.id;

      var elementsColor = document.getElementsByClassName(colorRadioElements);

      var color = window
        .getComputedStyle(elementsColor[0], null)
        .getPropertyValue("background-image");

      rgbColorSecondary = color.substring(
        color.indexOf("b") + 2,
        color.indexOf(")")
      );
      rgbColorPrimary = color.substring(
        color.lastIndexOf("(") + 1,
        color.lastIndexOf(")") - 1
      );
    }

    item.addEventListener("click", function (event) {
      if (item.id) {
        localStorage.setItem("activeCustomcolor", item.id);
      }
      // choose theme color
      var colorRadioElements = document.querySelector(
        "input[name=bgcolor-radio]:checked"
      );

      if (colorRadioElements) {
        colorRadioElements = colorRadioElements.id;

        var elementsColor = document.getElementsByClassName(colorRadioElements);
        if (elementsColor) {
          var color = window
            .getComputedStyle(elementsColor[0], null)
            .getPropertyValue("background-image");

          rgbColorSecondary = color.substring(
            color.indexOf("b") + 2,
            color.indexOf(")")
          );
          rgbColorPrimary = color.substring(
            color.lastIndexOf("(") + 1,
            color.lastIndexOf(")") - 1
          );

          window.localStorage.setItem("colorPrimary", rgbColorPrimary);
          window.localStorage.setItem("colorSecondary", rgbColorSecondary);

          document.documentElement.style.setProperty(
            "--bs-primary-rgb",
            window.localStorage.getItem("colorPrimary")
          );
          document.documentElement.style.setProperty(
            "--bs-secondary-rgb",
            window.localStorage.getItem("colorSecondary")
          );
        }
      }
    });
  });

  // primary color picker
  var classicPickrPrimary = document.querySelectorAll(".colorpicker-primary");
  classicPickrPrimary.forEach(function () {
    var primarycolor = localStorage.getItem("colorPrimary")
      ? "rgba(" + localStorage.getItem("colorPrimary") + ",1)"
      : "#6153CC";

    var primaryPicker = Pickr.create({
      el: ".colorpicker-primary",
      theme: "nano", // or 'monolith', or 'nano'
      default: primarycolor,
      swatches: null,
      defaultRepresentation: "RGBA",
      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: false,
          rgba: false,
          hsva: false,
          input: true,
          clear: true,
          save: true,
        },
      },
    });

    // primary colorpicker
    primaryPicker
      .on("clear", function (instance) {
        // console.log('Event: "clear"', instance);
      })
      .on("cancel", function (instance) {
        // console.log('cancel', primaryPicker.getColor().toRGBA().toString(0));
      })
      .on("change", function (color, source, instance) {
        // console.log('Event: "change"', instance, primaryPicker.getColor().toRGBA().toString(0));
        var primaryColorValue = primaryPicker.getColor().toRGBA().toString(0);

        rgbColorsPrimary = primaryColorValue.substring(
          primaryColorValue.indexOf("(") + 1,
          primaryColorValue.lastIndexOf(",")
        );
        localStorage.setItem("colorPrimary", rgbColorsPrimary);

        document.documentElement.style.setProperty(
          "--bs-primary-rgb",
          window.localStorage.getItem("colorPrimary")
        );
      });
  });

  // secondary color picker
  var classicPickrSecondary = document.querySelectorAll(
    ".colorpicker-secondary"
  );
  classicPickrSecondary.forEach(function () {
    var secondarycolor = localStorage.getItem("colorSecondary")
      ? "rgba(" + localStorage.getItem("colorSecondary") + ",1)"
      : "#b966c1";
    var secondaryPicker = Pickr.create({
      el: ".colorpicker-secondary",
      theme: "nano", // or 'monolith', or 'nano'
      default: secondarycolor,
      swatches: null,
      defaultRepresentation: "RGBA",
      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          hex: false,
          rgba: false,
          hsva: false,
          input: true,
          clear: true,
          save: true,
        },
      },
    });
    // primary colorpicker
    secondaryPicker
      .on("clear", function (instance) {
        // console.log('Event: "clear"', instance);
      })
      .on("cancel", function (instance) {
        // console.log('cancel', secondaryPicker.getColor().toRGBA().toString(0));
      })
      .on("change", function (color, source, instance) {
        // console.log('Event: "change"', instance, secondaryPicker.getColor().toRGBA().toString(0));
        var secondaryColorValue = secondaryPicker
          .getColor()
          .toRGBA()
          .toString(0);

        rgbColorSecondary = secondaryColorValue.substring(
          secondaryColorValue.lastIndexOf("(") + 1,
          secondaryColorValue.lastIndexOf(",")
        );

        localStorage.setItem("colorSecondary", rgbColorSecondary);

        document.documentElement.style.setProperty(
          "--bs-secondary-rgb",
          window.localStorage.getItem("colorSecondary")
        );
      });
  });
}
var primaryColor = window
  .getComputedStyle(document.body, null)
  .getPropertyValue("--bs-primary-rgb");
themeColor(primaryColor);
// color style change ends

// chat emojiPicker input
var emojiPicker = new FgEmojiPicker({
  trigger: [".emoji-btn"],
  removeOnSelection: false,
  closeButton: true,
  position: ["top", "right"],
  preFetch: true,
  dir: dirs,
  insertInto: document.querySelector(".chat-input"),
});

// emojiPicker position
var emojiBtn = document.getElementById("emoji-btn");
emojiBtn.addEventListener("click", function () {
  setTimeout(function () {
    var fgEmojiPicker = document.getElementsByClassName("fg-emoji-picker")[0];
    if (fgEmojiPicker) {
      var leftEmoji = window.getComputedStyle(fgEmojiPicker)
        ? window.getComputedStyle(fgEmojiPicker).getPropertyValue("left")
        : "";
      if (leftEmoji) {
        leftEmoji = leftEmoji.replace("px", "");
        leftEmoji = leftEmoji - 40 + "px";
        fgEmojiPicker.style.left = leftEmoji;
      }
    }
  }, 0);
});


(function () {
  "use strict";

  function initComponents() {
    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    var popoverTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }

  function initSettings() {
    var body = document.getElementsByTagName("body")[0];
    var lightDarkBtn = document.querySelectorAll(".light-dark-mode");
    if (lightDarkBtn && lightDarkBtn.length) {
      lightDarkBtn.forEach(function (item) {
        item.addEventListener("click", function (event) {
          if (
            body.hasAttribute("data-bs-theme") &&
            body.getAttribute("data-bs-theme") == "dark"
          ) {
            // document.body.setAttribute("data-bs-theme", "light");
            document.body.removeAttribute("data-bs-theme");
          } else {
            document.body.setAttribute("data-bs-theme", "dark");
          }
        });
      });
    }
  }

  function init() {
    initComponents();
    initSettings();
    Waves.init();
  }

  init();
})();