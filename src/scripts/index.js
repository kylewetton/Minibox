// uncomment for packing
import "../styles/index.scss";

// Minibox is a controller class that initiates the boxes to make usage easier for the end developer

class Minibox {
  constructor(settings) {
    const defaults = {
      element: ".minibox",
      trigger: ".minibox-trigger",
      padding: "0",
      theme: "default",
      crossColor: "#222222",
    };

    this.settings = Object.assign(defaults, settings);
    this.el = null;
    this.miniboxes = [];
    this.currentlyOpen = [];
    this.triggers = null;
    this._openEvents = [];
    this._closeEvents = [];
    this._mount();
  }

  _mount() {
    this.el = document.querySelectorAll(this.settings.element);
    this.triggers = document.querySelectorAll(this.settings.trigger);

    this.miniboxes = [...this.el].map(
      (box) => new BoxElement(box, this.settings, this)
    );
    [...this.triggers].forEach((trigger) =>
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        this._toggle(e);
      })
    );
  }

  open(target = null, href = null) {
    if (this.miniboxes.length === 0) return;

    let boxToOpen = [];

    if (href) {
      const img = document.createElement("img");
      img.setAttribute("src", href);
      img.classList.add("minibox");
      boxToOpen.push(new BoxElement(img, this.settings, this));
    } else {
      if (target) {
        boxToOpen = this.miniboxes.filter(
          (box) => box._getTargetId() === target
        );
      } else {
        boxToOpen = this.miniboxes;
      }
    }

    if (boxToOpen.length !== 0) {
      this.currentlyOpen[0] && this.currentlyOpen[0]._close();
      this.currentlyOpen = [];
      boxToOpen[0]._open();
    }

    this.currentlyOpen.push(boxToOpen[0]);

    if (this._openEvents.length > 0) {
      this._openEvents.forEach((event) => {
        if (event.trigger === this.currentlyOpen[0]._getTargetId()) {
          event.callback();
        }
      });
    }
  }

  close() {
    this.currentlyOpen[0] && this.currentlyOpen[0]._close();
  }

  afterOpen(trigger, callback) {
    this._openEvents.push({ trigger, callback });
  }

  afterClose(trigger, callback) {
    this._closeEvents.push({ trigger, callback });
  }

  // Used for event handling on links/buttons. Shouldn't really be called outside class
  _toggle({ target }) {
    const triggerId = target.dataset.toggle;
    let href = triggerId === "href" ? target.getAttribute("href") : null;

    if (
      this.currentlyOpen[0] &&
      this.currentlyOpen[0]._getTargetId() === triggerId
    ) {
      this.currentlyOpen[0]._close();
    } else {
      this.open(triggerId, href);
    }
  }
}

// The inner working class

class BoxElement {
  constructor(el, settings, controller, active = false) {
    this.el = el;
    this.settings = settings;
    this.active = active;
    this.controller = controller;
    this.closeButton = document.createElement("button");
    this.wrapper = null;
    this.appendTarget = null;
    this._createCloseButton();
    this._set();
  }

  _toggle() {
    this.active = !this.active;
    this._set();
  }

  _close() {
    if (this.controller._closeEvents.length > 0) {
      this.controller._closeEvents.forEach((event) => {
        if (event.trigger === this.controller.currentlyOpen[0]._getTargetId()) {
          event.callback();
        }
      });
    }

    this.controller.currentlyOpen = [];
    this.active = false;
    this._set();
  }

  _open() {
    this.active = true;
    this._set();
  }

  _set() {
    this.active
      ? (this.el.style.cssText -= `display: none`)
      : (this.el.style.cssText += `display: none`);

    this.active ? this._buildScaffold() : this._removeScaffold();
  }

  _buildScaffold() {
    // Build the first time, then store.
    if (this.wrapper === null) {
      const wrapper = document.createElement("div");
      const inner = document.createElement("div");

      wrapper.classList.add("minibox__wrapper");
      wrapper.style.cssText += `background: rgba(0,0,0,0.75)`;
      let that = this;
      wrapper.addEventListener("click", function (e) {
        if (e.target === this) that.close();
      });

      inner.classList.add(`minibox__inner`, `theme-${this.settings.theme}`);
      inner.style.cssText += `padding: ${this.settings.padding}`;

      this.appendTarget = inner;
      wrapper.appendChild(this.appendTarget);
      this.appendTarget.appendChild(this.closeButton);
      this.wrapper = wrapper;
    }

    this.appendTarget.appendChild(this.el);
    document.body.appendChild(this.wrapper);
    setTimeout(() => {
      this.appendTarget.classList.add("pop-in");
    });
  }

  _removeScaffold() {
    if (this.wrapper) document.body.removeChild(this.wrapper);
    if (this.appendTarget) this.appendTarget.classList.remove("pop-in");
  }

  _createCloseButton() {
    this.closeButton.innerHTML = `<svg class="minibox__cross" xmlns="http://www.w3.org/2000/svg" fill="${this.settings.crossColor}" stroke="${this.settings.crossColor}" viewBox="0 0 74 74"><path d="M46.2 37l25.9-25.8a6.5 6.5 0 10-9.3-9.3L37 27.8 11.2 1.9a6.5 6.5 0 10-9.3 9.3L27.8 37 1.9 62.8a6.5 6.5 0 109.3 9.3L37 46.2l25.8 25.9a6.5 6.5 0 109.3-9.3L46.2 37z"/></svg>`;

    this.closeButton.classList.add("minibox__close");
    this.closeButton.addEventListener("click", () => {
      this._close();
    });
  }

  _getTargetId() {
    return this.el.dataset.minibox;
  }
}

export default Minibox;
