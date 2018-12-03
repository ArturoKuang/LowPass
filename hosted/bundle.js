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
        canvas.width = "1000";
        canvas.height = "1000";
        ctx.drawImage(img, 0, 0, 1000, 1000);
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
'use strict';

var loadAllPublicImagesFromServer = function loadAllPublicImagesFromServer(csrf) {
    sendAjax('GET', '/files/public', null, function (data) {
        ReactDOM.render(React.createElement(PublicImages, { files: data, csrf: csrf }), document.querySelector('#content'));
    });
};

var handleImageView = function handleImageView(e) {
    e.preventDefault();
    ClearBody();

    var queryString = '/comments?id=' + e.target.id;
    var imageId = e.target.id;
    var path = e.target.src;
    var csrf = getCSRF();
    // sendAjax('GET', queryString, null, (data) => {
    //     ReactDOM.render(
    //         <CreateImageView csrf={csrf} imageId={imageId} imagePath={path} comments={data} />,
    //         document.querySelector("#content")
    //     );
    // });
    fetchComments(csrf, imageId, path, queryString);
};

var fetchComments = function fetchComments(csrf, imageId, imagePath, queryString) {
    $.ajax({
        url: queryString,
        type: 'GET',
        success: function success(data) {
            ReactDOM.render(React.createElement(CreateImageView, { csrf: csrf, imageId: imageId, imagePath: imagePath, comments: data }), document.querySelector("#content"));
        },
        complete: function complete(data) {
            timer = setTimeout(fetchComments(csrf, imageId, imagePath, queryString), 10000);
        }
    });
};

var CreateImageView = function CreateImageView(props) {
    return React.createElement(
        'div',
        { className: 'centered ui segment' },
        React.createElement(
            'div',
            { className: 'ui two column grid ' },
            React.createElement(
                'div',
                { className: 'column centered ui large image' },
                React.createElement('img', { src: props.imagePath, alt: 'image', className: 'content' })
            ),
            React.createElement(CommentView, { imageId: props.imageId, csrf: props.csrf, comments: props.comments })
        )
    );
};

var CommentView = function CommentView(props) {
    return React.createElement(
        'div',
        { className: 'column centered' },
        React.createElement(Comments, { comments: props.comments }),
        React.createElement(
            'form',
            {
                id: 'commentForm',
                name: 'commentForm',
                className: 'ui reply form',
                action: '/comments',
                method: 'POST',
                onSubmit: handleComment
            },
            React.createElement('input', { id: 'commentText', name: 'commentText', type: 'text', placeholder: 'Reply...' }),
            React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
            React.createElement('input', { type: 'hidden', name: 'id', value: props.imageId }),
            React.createElement('input', { type: 'hidden', name: 'author', value: username }),
            React.createElement('input', { className: 'ui button formSubmit', type: 'submit', value: 'Add Reply' })
        )
    );
};

var Comments = function Comments(props) {
    if (props.comments.comments.length === 0 || !props.comments.comments.length) {
        return React.createElement(
            'div',
            null,
            ' No comments'
        );
    }

    var allComments = props.comments.comments.map(function (c) {
        var commentDate = c.createdDate.split('T')[0];
        return React.createElement(
            'div',
            { className: 'comment' },
            React.createElement(
                'a',
                { className: 'avatar' },
                React.createElement(
                    'i',
                    { className: 'user icon' },
                    ' '
                )
            ),
            React.createElement(
                'div',
                { className: 'content' },
                React.createElement(
                    'a',
                    { className: 'author' },
                    c.author
                ),
                React.createElement(
                    'div',
                    { className: 'metadata' },
                    React.createElement(
                        'span',
                        { className: 'date' },
                        commentDate
                    )
                ),
                React.createElement(
                    'div',
                    { 'class': 'text' },
                    c.text
                )
            )
        );
    });

    return React.createElement(
        'div',
        { className: 'ui comments' },
        allComments
    );
};

var handleComment = function handleComment(e) {
    e.preventDefault();
    if ($("#commentText").value == '') {
        handleError("Reply empty");
        return false;
    }

    var commentForm = $("#commentForm").serialize();

    sendAjax('POST', $("#commentForm").attr("action"), commentForm, function (err, data) {
        console.log(data);
    });
};

var PublicImages = function PublicImages(props) {
    if (!props.files) {
        return React.createElement(
            'div',
            { className: 'imageList' },
            React.createElement(
                'h3',
                { className: 'emptyDomo' },
                'No Images Yet'
            )
        );
    }

    var ImageCards = props.files.images.map(function (file) {
        var filePath = '' + file.url;
        var fileKey = file.keyPath.split('/')[1];
        return React.createElement(
            'div',
            { id: fileKey, key: fileKey, className: 'four wide column' },
            React.createElement(
                'div',
                { className: '' },
                React.createElement(
                    'div',
                    { className: 'ui medium fade reveal image' },
                    React.createElement(
                        'a',
                        { href: '', onClick: handleImageView },
                        React.createElement('img', { id: file._id, src: filePath, alt: 'image', className: 'content centered' }),
                        React.createElement(
                            'div',
                            { className: 'hidden content' },
                            '  '
                        )
                    )
                )
            )
        );
    });

    return React.createElement(
        'div',
        { className: 'ui grid centered container' },
        ImageCards
    );
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

    $("#uploadForm").ajaxSubmit({

        error: function error(xhr) {
            handleError(xhr.status);
        },

        success: function success(response) {
            redirect(response);
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
                className: "mainForm ui form centered card",
                onSubmit: handleImageForm },
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "div",
                    { className: "field" },
                    React.createElement(
                        "label",
                        { "for": "title", className: "uploadFormField", htmlFor: "title" },
                        " Title "
                    ),
                    React.createElement("input", { type: "text", id: "uploadTitle", name: "title", placeholder: "something cool..." })
                )
            ),
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "div",
                    { className: "field" },
                    React.createElement(
                        "label",
                        { "for": "tag", className: "uploadFormField", htmlFor: "tag" },
                        " Tag "
                    ),
                    React.createElement("input", { type: "text", id: "uploadTag", name: "tag", placeholder: "scenic rit memes" })
                )
            ),
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "div",
                    { className: "ui toggle checkbox" },
                    React.createElement("input", { type: "checkbox", name: "public" }),
                    React.createElement(
                        "label",
                        null,
                        "Public"
                    )
                )
            ),
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "div",
                    { className: "field" },
                    React.createElement(
                        "label",
                        { "for": "file", className: "uploadFormField" },
                        "Choose File"
                    ),
                    React.createElement("input", { type: "file", name: "file", id: "file", className: "", onChange: readImageURL })
                )
            ),
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement(
                "div",
                { className: "extra content" },
                React.createElement("input", { type: "submit", value: "Upload", className: "ui button formSubmit" })
            ),
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
            { className: "ui card centered" },
            React.createElement(
                "div",
                { className: "ui medium rounded image" },
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

var handlePasswordForm = function handlePasswordForm(e) {
    e.preventDefault();

    if ($("#pass").val() == '' || $("#pass2").val() == '') {
        handleError("All fields are required");
        return false;
    }

    sendAjax('POST', $("#passwordForm").attr("action"), $("#passwordForm").serialize(), handleSuccess);

    return false;
};

var PasswordForm = function PasswordForm(props) {
    return React.createElement(
        "div",
        null,
        React.createElement(
            "form",
            {
                id: "passwordForm",
                name: "passwordForm",
                action: "/changePassword",
                method: "POST",
                className: "mainForm ui form centered card",
                onSubmit: handlePasswordForm },
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "div",
                    { className: "field" },
                    React.createElement(
                        "label",
                        { "for": "title", className: "passwordFormField", htmlFor: "title" },
                        " Current Password: "
                    ),
                    React.createElement("input", { type: "password", id: "oldpassword", name: "title", placeholder: "Current Password" })
                )
            ),
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "div",
                    { className: "field" },
                    React.createElement(
                        "label",
                        { "for": "title", className: "passwordFormField", htmlFor: "title" },
                        " New Password: "
                    ),
                    React.createElement("input", { type: "password", id: "pass", name: "title", placeholder: "New password" })
                )
            ),
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "div",
                    { className: "field" },
                    React.createElement(
                        "label",
                        { "for": "tag", className: "passwordFormField", htmlFor: "tag" },
                        " New Password: "
                    ),
                    React.createElement("input", { type: "password", id: "pass2", name: "tag", placeholder: "Retype New password" })
                )
            ),
            React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
            React.createElement(
                "div",
                { className: "extra content" },
                React.createElement("input", { type: "submit", value: "password", className: "ui button formSubmit" })
            ),
            React.createElement("div", { "class": "ui error message" })
        )
    );
};
"use strict";

var username = "";
var timer = "";

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

  var ImageCards = props.files.images.map(function (file) {
    var filePath = "" + file.url;
    var fileDate = file.fileDate.split('T')[0];

    var tagList = null;
    if (file.tags) {
      tagList = file.tags.split(' ').map(function (tag) {
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
    var fileKey = file.keyPath.split('/')[1];
    return React.createElement(
      "div",
      { id: fileKey, key: fileKey, className: "ui card" },
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
          file.title
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
    { className: "ui relaxed three cards" },
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

var CreatePasswordPage = function CreatePasswordPage(csrf) {
  ReactDOM.render(React.createElement(PasswordForm, { csrf: csrf }), document.querySelector('#content'));
};

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
      { className: "ui header" },
      React.createElement("i", { className: "user icon" }),
      React.createElement(
        "div",
        { className: "content" },
        props.name,
        " profile:"
      )
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
    username = data.info.username;
    ReactDOM.render(React.createElement(AccountInfo, { csrf: csrf, name: data.info.username }), document.querySelector('#userInfo'));
  });
};

var CreateAccountPage = function CreateAccountPage(csrf) {
  ClearBody();
  loadUserInfo(csrf);

  ReactDOM.render(React.createElement(AccountView, { csrf: csrf, files: [], name: "User" }), document.querySelector("#content"));
};

var ClearBody = function ClearBody() {
  clearTimeout(timer);

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
  var navExploreButton = document.querySelector("#navExploreButton");
  var navPassButton = document.querySelector("#navChangePassword");

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

  navExploreButton.addEventListener("click", function (e) {
    e.preventDefault();
    ClearCaman();
    ClearBody();
    loadAllPublicImagesFromServer(csrf);
  });

  navPassButton.addEventListener("click", function (e) {
    e.preventDefault();
    ClearCaman();
    ClearBody();
    CreatePasswordPage(csrf);
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

var getCSRF = function getCSRF() {
  sendAjax('GET', '/getToken', null, function (result) {
    return result.csrfToken;
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
    $("#boxSuccessMessage").text(message.success);
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
