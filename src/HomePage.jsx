import React, { Component } from "react";
import axios from "axios";
import "./HomePage.css";
import Queue from "./misc/Queue";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InfiniteScroll from "react-infinite-scroll-component";

function getConfig(text, page) {
  let url;
  if (text) {
    const BASE_URL =
      "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=7e1c474387d9144c9a01b2c9909372bb&";
    url = `${BASE_URL}text=${text}&page=${page}&format=json&nojsoncallback=1`;
  } else {
    const BASE_URL =
      "https://api.flickr.com/services/rest/?method=flickr.photos.getRecent&api_key=7e1c474387d9144c9a01b2c9909372bb&";
    url = `${BASE_URL}page=${page}&format=json&nojsoncallback=1`;
  }




  return {
    method: "get",
    url,
  };
}

// import Images from "./Images";

class HomePage extends Component {
  constructor(props) {
    super(props);
    let recentSearch = localStorage.getItem("recentSearch") || "[]";
    this.state = {
      results: [],
      isOpen: false,
      photoDialog: {},
      recentSearch: new Queue(JSON.parse(recentSearch), 5),
      text: "",
      page: 1,
      pages: 2,
    };
    this.timeout = 0;
  }

  componentDidMount() {
    // this.setState({page:1})
    // this.getRecent(this.page);
    this.getSearchedImage(this.state.text, 1)();
    console.log(this.state.recentSearch.getElements());
  }

  getData = (e) => {
    var text = e.target.value;
    if (text.length < 3) {
      if (text.length > this.state.text.length) return;
      if (text.length < this.state.text.length) {
        // this.getRecent(1); // remove this later
        this.getSearchedImage("", 1)();

        this.setState({
          text,
        });
        return;
      }
    }
    this.setState({ text });

    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    this.timeout = setTimeout(this.getSearchedImage(text, 1), 2000);
  };

  getSearchedImage = (text, page, isFirstCall = true) => {
    return () => {
      if (isFirstCall) {
        window.scrollTo(0, 0);
        this.setState({ page: 1 });
      }
      const config = getConfig(text, page);
      console.log(config);
      axios(config)
        .then((response) => {
          if (!response.data.photos.photo.length) {
            const notify = () =>
              toast.error(
                "Oopss!!! We could not find any Image for that one.",
                {
                  position: toast.POSITION.TOP_LEFT,
                }
              );
            notify();
            return;
          }
          // window.scrollTo(0, 0);
          // this.setState({ page: 1 });
          this.addTextToRecentSearch(text);
          this.setState({
            results:
              page === 1
                ? response.data.photos.photo
                : [...this.state.results, ...response.data.photos.photo],
            pages: response.data.photos.pages,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    };
  };

  addTextToRecentSearch = (text) => {
    let q = new Queue(this.state.recentSearch.getElements(), 5);
    q.enqueue(text);
    this.setState({
      recentSearch: q,
    });
    localStorage.setItem(
      "recentSearch",
      JSON.stringify(this.state.recentSearch.getElements())
    );
  };

  handleShowDialog = (photo) => {
    console.log(photo);
    this.setState(
      {
        isOpen: !this.state.isOpen,
        photoDialog: photo,
      },
      () => {
        console.log(this.state.isOpen, "and", this.state.photoDialog);
      }
    );
  };

  fetchMoreData = () => {
    console.log("fetching moreeeee", this.state.page, this.state.pages);
    this.getSearchedImage("", this.state.page + 1, false)();
    this.setState({ page: this.state.page + 1 });
  };

  render() {
    const { results, recentSearch, page, pages } = this.state;
    console.log(results);
    return (
      <div className="App">
        <ToastContainer />
        <div className="Header">
          <label className="Search-label">Search Photos</label>
          <br />
          <input
            list="browsers"
            type="search"
            name="search"
            id="photo-search"
            placeholder="Search..."
            onInput={this.getData}
            autoComplete="off"
          />
          <span class="input-group-addon fa fa-search" id="basic-addon2"></span>

          <datalist id="browsers">
            {recentSearch.getElements().map((text, i) => {
              return <option value={text} key={i} />;
            })}
          </datalist>
        </div>
        <div className="Column">
          <InfiniteScroll
            dataLength={results.length} //This is important field to render the next data
            next={this.fetchMoreData}
            hasMore={page < pages}
            loader={<h4>Loading...</h4>}
            endMessage={
              <p style={{ textAlign: "center" }}>
                <b>Yay! You have seen it all</b>
              </p>
            }
          >
            {this.state.results.map((photo, i) => {
              return (
                <img
                alt={photo.id}
                  key={i}
                  className="profile-pic"
                  onClick={() => this.handleShowDialog(photo)}
                  src={`https://live.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}_w.jpg`}
                />
              );
            })}
          </InfiniteScroll>
        </div>
        {this.state.isOpen && (
          <dialog className="dialog" open onClick={this.handleShowDialog}>
            <img
              src={`https://live.staticflickr.com/${this.state.photoDialog.server}/${this.state.photoDialog.id}_${this.state.photoDialog.secret}_w.jpg`}
              onClick={this.handleShowDialog}
              alt={this.state.photoDialog.id}
            />
          </dialog>
        )}
      </div>
    );
  }
}

export default HomePage;
