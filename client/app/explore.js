const loadAllPublicImagesFromServer = (csrf) => {
    sendAjax('GET', '/files/public', null, (data) => {
        ReactDOM.render(
            <PublicImages files={data} csrf={csrf} />,
            document.querySelector('#content')
        );
    });
};

const handleImageView = (e) => {
    e.preventDefault();
    ClearBody();

    var queryString = `/comments?id=${e.target.id}`;
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


const fetchComments = (csrf, imageId, imagePath, queryString) => {
    $.ajax({
        url: queryString,
        type: 'GET',
        success: function (data) {
            ReactDOM.render(
                <CreateImageView csrf={csrf} imageId={imageId} imagePath={imagePath} comments={data} />,
                document.querySelector("#content")
            );
        },
        complete: function (data) {
            timer = setTimeout(fetchComments(csrf, imageId, imagePath, queryString), 10000);
        }
    });
};


const CreateImageView = (props) => {
    return (
        <div className="centered ui segment">
            <div className="ui two column grid ">
                <div className="column centered ui large image">
                    <img src={props.imagePath} alt="image" className="content"></img>
                </div>
                <CommentView imageId={props.imageId} csrf={props.csrf} comments={props.comments}></CommentView>
            </div>
        </div>
    )
};

const CommentView = (props) => {
    return (
        <div className="column centered">
            <Comments comments={props.comments}></Comments>
            <form
                id="commentForm"
                name="commentForm"
                className="ui reply form"
                action="/comments"
                method="POST"
                onSubmit={handleComment}
            >
                <input id="commentText" name="commentText" type="text" placeholder="Reply..." />
                <input type="hidden" name="_csrf" value={props.csrf} />
                <input type="hidden" name="id" value={props.imageId} />
                <input type="hidden" name="author" value={username} />
                <input className="ui button formSubmit" type="submit" value="Add Reply" />
            </form>
        </div>
    )
};

const Comments = (props) => {
    if (props.comments.comments.length === 0 || !props.comments.comments.length) {
        return (
            <div> No comments</div>
        );
    }

    const allComments = props.comments.comments.map(function (c) {
        let commentDate = c.createdDate.split('T')[0];
        return (
            <div className="comment">
                <a className="avatar">
                    <i className="user icon"> </i>
                </a>
                <div className="content">
                    <a className="author">{c.author}</a>
                    <div className="metadata">
                        <span className="date">{commentDate}</span>
                    </div>
                    <div class="text">
                        {c.text}
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className="ui comments">
            {allComments}
        </div>
    );
};

const handleComment = (e) => {
    e.preventDefault();
    if ($("#commentText").value == '') {
        handleError("Reply empty");
        return false;
    }

    var commentForm = $("#commentForm").serialize();

    sendAjax('POST', $("#commentForm").attr("action"), commentForm, (err, data) => {
        console.log(data);
    });
};

const PublicImages = (props) => {
    if (!props.files) {
        return (
            <div className="imageList">
                <h3 className="emptyDomo">No Images Yet</h3>
            </div>
        );
    }

    const ImageCards = props.files.images.map(function (file) {
        let filePath = `${file.url}`;
        var fileKey = file.keyPath.split('/')[1];
        return (
            <div id={fileKey} key={fileKey} className="four wide column">
                <div className="">
                    <div className="ui medium fade reveal image">
                        <a href="" onClick={handleImageView}>
                            <img id={file._id} src={filePath} alt="image" className="content centered" />
                            <div className="hidden content">  </div>
                        </a>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className="ui grid centered container">
            {ImageCards}
        </div>
    );
};