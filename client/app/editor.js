const initCaman = () => {
    ReactDOM.render(
        <CreateEditPage />,
        document.querySelector("#caman")
    );
};

//image filters 
const Filters = () => {
    return (
        <div>
            <nav className="filters">
                <button id="resetbtn" className="ui button">Reset Photo</button>
                <button id="brightnessbtn" className="ui button">Brightness</button>
                <button id="noisebtn" className="ui button">Noise</button>
                <button id="sepiabtn" className="ui button">Sepia</button>
                <button id="contrastbtn" className="ui button">Contrast</button>
            </nav>
        </div>
    );
};

const CreateEditPage = () => {
    return (
        <div>
            <canvas id="canvas" width={500} height={500} />
            <Filters />
        </div>
    );
};


const handleEdit = (e) => {
    e.preventDefault();
    const filePath = e.target.parentElement.parentNode.querySelector("#imageDisplay").src;

    ClearBody();
    initCaman();
    const canvas = document.querySelector("#canvas");
    const ctx = canvas.getContext('2d');

    var img = new Image();
    img.crossOrigin = '';
    img.src = filePath;

    img.onload = function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
    }

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

