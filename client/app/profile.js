const ImageGrid = function (props) {
  if (props.files.length === 0) {
    return (
      <div className="imageList">
        <h3 className="emptyDomo">No Images Yet</h3>
      </div>
    );
  }

  const ImageCards = props.files.map(function (file) {
    if (
      file.contentType !== 'image/jpeg' &&
      file.contentType !== 'image/png'
    ) {
      return;
    }

    let filePath = `image/${file.filename}`;
    let fileDate = file.uploadDate.split('T')[0];
    let fileID = `${file._id}`;

    let tagList = null;
    if (file.metadata.tag) {
      let tagList = file.metadata.tag.split(' ').map((tag) => {
        return (
          <a className="ui label">
            <i className="tag icon"> {tag} </i>
          </a>
        );
      });
    }

    return (
      <div id={file._id} key={file._id} className="ui card">
        <div className="content">
          <div id="cardDate" className="right floated meta"> {fileDate}</div>
          <div id="cardTitle" className="left float meta">{file.metadata.title}</div>
        </div>
        <div className="content">
          <div className="image">
            <img id="imageDisplay" src={filePath} alt="d" className="ui medium image" />
          </div>
        </div>
        <div className="content">
          <button id="editButton" onClick={handleEdit} className="ui button">Edit</button>
          <button onClick={handleDelete} id="deleteButton" className="ui button">Delete</button>
        </div>
        <div className="content">
          {tagList}
        </div>
      </div>
    );
  });

  return (
    <div className="ui three cards">
      {ImageCards}
    </div>
  );
};


const handleDelete = (e, id) => {
  e.preventDefault();

  const fileID = e.target.parentElement.parentNode.id;

  sendAjax('DELETE', `/files/${fileID}?_method=DELETE`, null, function () {
    loadImagesFromServer();
  });
  return false;
};


const SignUpPage = (props) => {

}

const AccountView = (props) => {
  return (
    <div>
      <ImageGrid files={props.files} csrf={props.csrf} />
    </div>
  );
};

const AccountInfo = (props) => {
  return (
    <div>
      <h3>{props.name} profile: </h3>
    </div>
  );
};

const loadImagesFromServer = (csrf) => {
  sendAjax('GET', '/files', null, (data) => {
    ReactDOM.render(
      <ImageGrid files={data} csrf={csrf} />,
      document.querySelector('#content')
    );
  });
};

const loadUserInfo = (csrf) => {
  sendAjax('GET', '/getAccountInfo', null, (data) => {
    ReactDOM.render(
      <AccountInfo csrf={csrf} name={data.info.username} />,
      document.querySelector('#userInfo')
    );
  });
}

const CreateAccountPage = (csrf) => {
  ClearBody();
  loadUserInfo(csrf);

  ReactDOM.render(
    <AccountView csrf={csrf} files={[]} name="User" />,
    document.querySelector("#content")
  );
};

const ClearBody = () => {
  ReactDOM.render(
    <div></div>,
    document.querySelector('#userInfo')
  );

  ReactDOM.render(
    <div></div>,
    document.querySelector('#imagePreview')
  );

  ReactDOM.render(
    <div></div>,
    document.querySelector('#content')
  );
};

const ShowCaman = () => {
  const caman = document.querySelector("#caman");
  caman.style.display = "block";
}

const ClearCaman = () => {
  const caman = document.querySelector("#caman");
  caman.style.display = "none";
}

const setup = function (csrf) {
  const navUploadButton = document.querySelector("#navUploadButton");
  const navAccountButton = document.querySelector("#navAccountButton");

  navUploadButton.addEventListener("click", (e) => {
    e.preventDefault();
    ClearCaman();
    ClearBody();
    CreateUploadPage(csrf);
    return false;
  });

  navAccountButton.addEventListener("click", (e) => {
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


const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});