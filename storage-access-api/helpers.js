'use strict';

function RunTestsInIFrame(sourceURL) {
  let frame = document.createElement('iframe');
  frame.src = sourceURL;
  let result = new Promise((resolve, reject) => {
    frame.onload = resolve;
    frame.onerror = reject;
  });
  document.body.appendChild(frame);
  fetch_tests_from_window(frame.contentWindow);
  return result;
}

function RunTestsInNestedIFrame(sourceURL) {
  let nestedFrame = document.createElement('iframe');
  document.body.appendChild(nestedFrame);
  let result = new Promise((resolve, reject) => {
    nestedFrame.onload = resolve;
    nestedFrame.onerror = reject;
  });
  let content = `
    <script src="/resources/testharness.js"></script>
    <script src="helpers.js"></script>
    <body>
    <script>
      RunTestsInIFrame("${sourceURL}");
    </sc` + `ript>
  `;

    nestedFrame.contentDocument.write(content);
    nestedFrame.contentDocument.close();
    fetch_tests_from_window(nestedFrame.contentWindow);
    return result;
}

function RunRequestStorageAccessInDetachedFrame() {
  let nestedFrame = document.createElement('iframe');
  document.body.append(nestedFrame);
  const inner_doc = nestedFrame.contentDocument;
  nestedFrame.remove();
  return inner_doc.requestStorageAccess();
}

function RunRequestStorageAccessViaDomParser() {
  let parser = new DOMParser();
  let doc = parser.parseFromString('<html></html>', 'text/html');
  return doc.requestStorageAccess();
}

async function ClickButtonWithGesture(buttonId, onClickMethod) {
  // Append some formatting and information so non WebDriver instances can complete this test too.
  const info = document.createElement('p');
  info.innerText = "This test case requires user-interaction and TestDriver. If you're running it manually please click the 'Request Access' button below exactly once.";
  document.body.appendChild(info);

  const button = document.createElement('button');
  button.innerText = "Request Access";
  button.id = buttonId;
  button.style = "background-color:#FF0000;"

  // Insert the button and use test driver to click the button with a gesture.
  document.body.appendChild(button);

  const clickPromise = new Promise((resolve, reject) => {
    button.addEventListener('click', e => {
      onClickMethod().then(resolve, reject);
      button.style = "background-color:#00FF00;"
    }, {once: true});
  });

  await test_driver.click(button);
  return {clickPromise};
}
