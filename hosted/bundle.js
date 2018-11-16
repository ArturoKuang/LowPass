"use strict";

var initCaman = function initCaman() {
    ReactDOM.render(React.createElement(CreateEditPage, null), document.querySelector("#caman"));
};

//image filters 
var Filters = function Filters() {
    return React.createElement(
        "div",
        null,
        React.createElement(
            "nav",
            { className: "filters" },
            React.createElement(
                "button",
                { id: "resetbtn", className: "ui button" },
                "Reset Photo"
            ),
            React.createElement(
                "button",
                { id: "brightnessbtn", className: "ui button" },
                "Brightness"
            ),
            React.createElement(
                "button",
                { id: "noisebtn", className: "ui button" },
                "Noise"
            ),
            React.createElement(
                "button",
                { id: "sepiabtn", className: "ui button" },
                "Sepia"
            ),
            React.createElement(
                "button",
                { id: "contrastbtn", className: "ui button" },
                "Contrast"
            )
        )
    );
};

var CreateEditPage = function CreateEditPage() {
    return React.createElement(
        "div",
        null,
        React.createElement("canvas", { id: "canvas", width: 500, height: 500 }),
        React.createElement(Filters, null)
    );
};

var handleEdit = function handleEdit(e) {
    e.preventDefault();
    var filePath = e.target.parentElement.parentNode.querySelector("#imageDisplay").src;

    ClearBody();
    initCaman();
    var canvas = document.querySelector("#canvas");
    var ctx = canvas.getContext('2d');

    var img = new Image();
    img.crossOrigin = '';
    img.src = filePath;

    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
    };

    ShowCaman();

    document.getElementById("brightnessbtn").addEventListener("click", function () {
        Caman('#canvas', function () {
            this.brightness(30).render();
        });
    });

    document.getElementById("noisebtn").addEventListener("click", function () {
        Caman('#canvas', function () {
            this.noise(10).render();
        });
    });

    document.getElementById("sepiabtn").addEventListener("click", function () {
        Caman('#canvas', function () {
            this.sepia(20).render();
        });
    });

    document.getElementById("contrastbtn").addEventListener("click", function () {
        Caman('#canvas', function () {
            this.contrast(30).render();
        });
    });

    document.getElementById("resetbtn").addEventListener("click", function () {
        Caman('#canvas', function () {
            this.revert();
            this.render();
        });
    });
};
"use strict";

var CreateUploadPage = function CreateUploadPage(csrf) {
    ClearBody();

    ReactDOM.render(React.createElement(UploadForm, { csrf: csrf }), document.querySelector("#content"));
};

var handleImageForm = function handleImageForm(e) {
    e.preventDefault();

    if ($("#file").val() == '' || $("#uploadTag").val() == '' || $("#uploadTitle").val() == '') {
        handleError("error missing fields");
        return false;
    }

    $(uploadForm).ajaxSubmit({

        error: function error(xhr) {
            handleError(xhr.status);
        },

        success: function success(response) {
            handleSuccess(response.success);
        }

    });
    return false;
};

var UploadForm = function UploadForm(props) {
    var actionURL = "/uploadImage?_csrf=#" + props.csrf;
    return React.createElement(
        "div",
        null,
        React.createElement(
            "form",
            {
                id: "uploadForm",
                name: "uploadForm",
                action: actionURL,
                method: "POST",
                enctype: "multipart/form-data",
                className: "mainForm ui form",
                onSubmit: handleImageForm },
            React.createElement(
                "div",
                { className: "field" },
                React.createElement(
                    "label",
                    { "for": "file", className: "uploadFormField" },
                    "Choose File"
                ),
                React.createElement("input", { type: "file", name: "file", id: "file", className: "", onChange: readImageURL })
            ),
            React.createElement(
                "div",
                { className: "field" },
                React.createElement(
                    "label",
                    { "for": "title", className: "uploadFormField", htmlFor: "title" },
                    " Title "
                ),
                React.createElement("input", { type: "text", id: "uploadTitle", name: "title", placeholder: "something cool..." })
            ),
            React.createElement(
                "div",
                { className: "field" },
                React.createElement(
                    "label",
                    { "for": "tag", className: "uploadFormField", htmlFor: "tag" },
                    " Tag "
                ),
                React.createElement("input", { type: "text", id: "uploadTag", name: "tag", placeholder: "scenic rit memes" })
            ),
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement("input", { type: "submit", value: "Upload", className: "ui button formSubmit" }),
            React.createElement("div", { "class": "ui error message" })
        )
    );
};

var readImageURL = function readImageURL(input) {
    if (input.target.files && input.target.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            e.preventDefault();
            ReactDOM.render(React.createElement(BuildImagePreview, { imageURI: e.target.result }), document.querySelector("#imagePreview"));
        };

        reader.readAsDataURL(input.target.files[0]);
    }
};

var BuildImagePreview = function BuildImagePreview(props) {
    var imageURI = props.imageURI;
    if (imageURI !== null && imageURI !== undefined) {
        return React.createElement(
            "div",
            { className: "ui" },
            React.createElement(
                "div",
                { className: "ui" },
                React.createElement("img", { className: "thumbnail", src: imageURI })
            )
        );
    }
    return React.createElement(
        "div",
        null,
        "No picture"
    );
};
"use strict";

var ImageGrid = function ImageGrid(props) {
  if (props.files.length === 0) {
    return React.createElement(
      "div",
      { className: "imageList" },
      React.createElement(
        "h3",
        { className: "emptyDomo" },
        "No Images Yet"
      )
    );
  }

  var ImageCards = props.files.map(function (file) {
    if (file.contentType !== 'image/jpeg' && file.contentType !== 'image/png') {
      return;
    }

    var filePath = "image/" + file.filename;
    var fileDate = file.uploadDate.split('T')[0];
    var fileID = "" + file._id;

    var tagList = null;
    if (file.metadata.tag) {
      tagList = file.metadata.tag.split(' ').map(function (tag) {
        return React.createElement(
          "a",
          { className: "ui label" },
          React.createElement(
            "i",
            { className: "tag icon" },
            " ",
            tag,
            " "
          )
        );
      });
    }

    return React.createElement(
      "div",
      { id: file._id, key: file._id, className: "ui card" },
      React.createElement(
        "div",
        { className: "content" },
        React.createElement(
          "div",
          { id: "cardDate", className: "right floated meta" },
          " ",
          fileDate
        ),
        React.createElement(
          "div",
          { id: "cardTitle", className: "left float meta" },
          file.metadata.title
        )
      ),
      React.createElement(
        "div",
        { className: "content" },
        React.createElement(
          "div",
          { className: "image" },
          React.createElement("img", { id: "imageDisplay", src: filePath, alt: "d", className: "ui medium image" })
        )
      ),
      React.createElement(
        "div",
        { className: "content" },
        React.createElement(
          "button",
          { id: "editButton", onClick: handleEdit, className: "ui button" },
          "Edit"
        ),
        React.createElement(
          "button",
          { onClick: handleDelete, id: "deleteButton", className: "ui button" },
          "Delete"
        )
      ),
      React.createElement(
        "div",
        { className: "content" },
        tagList
      )
    );
  });

  return React.createElement(
    "div",
    { className: "ui three cards" },
    ImageCards
  );
};

var handleDelete = function handleDelete(e, id) {
  e.preventDefault();

  var fileID = e.target.parentElement.parentNode.id;

  sendAjax('DELETE', "/files/" + fileID + "?_method=DELETE", null, function () {
    loadImagesFromServer();
  });
  return false;
};

var SignUpPage = function SignUpPage(props) {};

var AccountView = function AccountView(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(ImageGrid, { files: props.files, csrf: props.csrf })
  );
};

var AccountInfo = function AccountInfo(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "h3",
      null,
      props.name,
      " profile: "
    )
  );
};

var loadImagesFromServer = function loadImagesFromServer(csrf) {
  sendAjax('GET', '/files', null, function (data) {
    ReactDOM.render(React.createElement(ImageGrid, { files: data, csrf: csrf }), document.querySelector('#content'));
  });
};

var loadUserInfo = function loadUserInfo(csrf) {
  sendAjax('GET', '/getAccountInfo', null, function (data) {
    ReactDOM.render(React.createElement(AccountInfo, { csrf: csrf, name: data.info.username }), document.querySelector('#userInfo'));
  });
};

var CreateAccountPage = function CreateAccountPage(csrf) {
  ClearBody();
  loadUserInfo(csrf);

  ReactDOM.render(React.createElement(AccountView, { csrf: csrf, files: [], name: "User" }), document.querySelector("#content"));
};

var ClearBody = function ClearBody() {
  ReactDOM.render(React.createElement("div", null), document.querySelector('#userInfo'));

  ReactDOM.render(React.createElement("div", null), document.querySelector('#imagePreview'));

  ReactDOM.render(React.createElement("div", null), document.querySelector('#content'));
};

var ShowCaman = function ShowCaman() {
  var caman = document.querySelector("#caman");
  caman.style.display = "block";
};

var ClearCaman = function ClearCaman() {
  var caman = document.querySelector("#caman");
  caman.style.display = "none";
};

var setup = function setup(csrf) {
  var navUploadButton = document.querySelector("#navUploadButton");
  var navAccountButton = document.querySelector("#navAccountButton");

  navUploadButton.addEventListener("click", function (e) {
    e.preventDefault();
    ClearCaman();
    ClearBody();
    CreateUploadPage(csrf);
    return false;
  });

  navAccountButton.addEventListener("click", function (e) {
    e.preventDefault();
    ClearCaman();
    ClearBody();
    CreateAccountPage(csrf);
    loadImagesFromServer(csrf);
    return false;
  });

  ClearCaman();
  CreateAccountPage(csrf);
  loadImagesFromServer(csrf);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
    $("#boxErrorMessage").text(message);
    $("#boxErrorMessage").transition('fade').transition('fade', 500);
};

var handleSuccess = function handleSuccess(message) {
    $("#boxSuccessMessage").text(message);
    $("#boxSuccessMessage").transition('fade').transition('fade', 500);
};

var redirect = function redirect(response) {
    $("#boxErrorMessage").animate({ width: 'hide' }, 350);
    window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
    $.ajax({
        cache: false,
        type: type,
        url: action,
        data: data,
        success: success,
        error: function error(xhr, status, _error) {
            var messageObj = JSON.parse(xhr.responseText);
            handleError(messageObj.error);
        }
    });
};
