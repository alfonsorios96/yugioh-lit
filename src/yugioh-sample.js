import {LitElement, html, css} from 'lit';

import '@vaadin/grid';
import '@vaadin/grid/all-imports';
import '@vaadin/text-field/vaadin-text-field';
import '@vaadin/button';

class YugiohSample extends LitElement {
  static properties = {
    cards: {type: Array},
    totalPages: {type: Array},
    name: {type: String},
    page: {type: Number},
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--yugioh-sample-background-color);
    }

    main {
      width: 100%;
      flex-grow: 1;
    }

    .table {
      width: 90%;
    }

    .row {
      display: flex;
      justify-content: space-around;
    }

    .row p {
      color: gray;
      cursor: pointer;
    }

    .row p.active {
      font-weight: 800;
      color: black;
    }

    .card-picture {
      height: 200px;
      width: auto;
    }
  `;

  constructor() {
    super();
    this.cards = [];
    this.totalPages = Array(10).fill().map((_, index) => index + 1);
    this.name = "";
    this.page = 1;
  }

  async updated(_changedProperties) {
    if (_changedProperties.has("name") || _changedProperties.has("page")) {
      await this.getCards();
      await this.getPages();
    }
  }

  async getPages() {
    const params = {};
    if (this.name !== "") {
      params.name_like = this.name;
    }
    const response = await fetch(`http://localhost:3004/data?${Object.entries(params).reduce((acc, param) => {
      return acc + `${param[0]}=${param[1]}&`;
    }, "")}`);

    const payload = await response.json();
    this.totalPages = Array(Math.round(payload.length / 4)).fill().map((_, index) => index + 1);
  }

  async getCards() {
    let params = {
      _limit: 4
    };
    if (this.name !== "") {
      params.name_like = this.name;
    }
    if (this.page > 0) {
      params._page = this.page;
    }
    const response = await fetch(`http://localhost:3004/data?${Object.entries(params).reduce((acc, param) => {
      return acc + `${param[0]}=${param[1]}&`;
    }, "")}`);

    const payload = await response.json();
    this.cards = payload;

    const gridColumnPicture = this.shadowRoot.querySelector("#pictureNode");

    if (gridColumnPicture) {
      gridColumnPicture.renderer = function (root, column, model) {
        root.innerHTML = `<img class="card-picture" src="${model.item.card_images[0].image_url_small}" alt="${model.item.name}">`;
      };
    }
  }

  render() {
    return html`
      <main>
        <vaadin-text-field label="Card name" @input="${(event) => {
          const name = event.currentTarget.value;
          if (name.length >= 3 || name.length === 0) {
            this.name = name;
          }
        }}"></vaadin-text-field>

        ${this.cards.length > 0 ? html`
          <vaadin-grid .items="${this.cards}" class="table">
            <vaadin-grid-column path="name" header="Name"></vaadin-grid-column>
            <vaadin-grid-column path="desc" header="Description"></vaadin-grid-column>
            <vaadin-grid-column id="pictureNode" header="Picture"></vaadin-grid-column>
          </vaadin-grid>

          <div class="row">
            ${this.totalPages.map((_page) => html`
              <p @click="${() => {
                this.page = _page;
              }}" class="${_page === this.page ? "active" : ""}">${_page}</p>
            `)}
          </div>
        ` : html`
          <img src="https://www.crossduelmeta.com/_app/immutable/assets/missing-card-22b35a89.webp" alt="Not found">
        `}
      </main>
    `;
  }
}

customElements.define('yugioh-sample', YugiohSample);
