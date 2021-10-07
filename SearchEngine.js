class SearchEngine {
  constructor(query) {
    this.query = encodeURI(query);
    this.googleUrl = `${googleSearchEngineUrl}?key=${googleSearchEngineAPI}&cx=${googleSearchEngineId}&q=${this.query}`;

    this.wikipediaUrl = `${wikipediaUrl}?action=query&format=json&prop=description&generator=prefixsearch&gpslimit=10&gpssearch=${this.query}`;

    this.brainlyUrl = `${brainlyUrl}?operationName=SearchQuery&variables=%7B%22query%22%3A%22${this.query}%22%2C%22after%22%3Anull%2C%22first%22%3A10%7D&extensions=%7B%22persistedQuery%22%3A%7B%22version%22%3A1%2C%22sha256Hash%22%3A%224c6e5c1fc69291501c2b9c59cdd10b8f3d1a832372784112bb47d64cdceb6a9e%22%7D%7D`;
  }

  webSearch() {
    const req = UrlFetchApp.fetch(this.googleUrl, {
      muteHttpExceptions: true,
    });

    const res = JSON.parse(req.getContentText());
    let result = [];

    if (res.items) {
      res.items.forEach((item) => {
        result.push({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        });
      });
    } else {
      return {
        success: true,
        result: 0,
      };
    }

    return {
      success: true,
      result,
    };
  }

  imageSearch() {
    const req = UrlFetchApp.fetch(`${this.googleUrl}&searchType=image`, {
      muteHttpExceptions: true,
    });

    const res = JSON.parse(req.getContentText());
    let result = [];

    if (res.items) {
      res.items.forEach((item) => {
        if (item.link.match(/\.(jpeg|jpg|png)$/i)) {
          result.push({
            title: item.title,
            link: item.link,
          });
        }
      });
    } else {
      return {
        success: true,
        result: 0,
      };
    }

    return {
      success: true,
      result,
    };
  }

  brainlySearch() {
    const req = UrlFetchApp.fetch(this.brainlyUrl, {
      muteHttpExceptions: true,
    });

    const res = JSON.parse(req.getContentText());
    const data = res.data.questionSearch;

    let result = [];
    if (data.count > 1) {
      data.edges.forEach((edge) => {
        const node = edge.node;
        result.push({
          id: node.id,
          content: node.content,
          url: `https://brainly.co.id/tugas/${node.databaseId}`,
        });
      });
    } else {
      return {
        success: true,
        result: 0,
      };
    }

    return {
      success: true,
      result,
    };
  }

  wikiSearch() {
    const req = UrlFetchApp.fetch(this.wikipediaUrl, {
      muteHttpExceptions: true,
    });

    const res = JSON.parse(req.getContentText());
    let result = [];
    if (res.query) {
      const pages = Object.values(res.query.pages);

      pages.forEach((page) => {
        result.push({
          link: `https://en.wikipedia.org/?curid=${page.pageid}`,
          title: page.title,
          description: page.description,
        });
      });
    } else {
      return {
        success: true,
        result: 0,
      };
    }

    return {
      success: true,
      result,
    };
  }
}
