const testdata = { title: "test", tag: ["Light", "IDE"], code: "#3F0E40,#000000,#1164A3,#FFFFFF,#4D2A51,#FFFFFF,#2BAC76,#CD2553,#350D36,#FFFFFF", author: "User" };
const dataParse = () => {
  let row = Number(Browser.inputBox("Row?"));
  // let row = 1;
  const sheet = intialzeSheet();
  let range = sheet.getRange(row + 1, 1, 1, 4).getValues()[0];
  let contentData = range[1];
  let cipher = new cCryptoGS.Cipher(base64.btoa(range[0]), "tripledes");
  contentData = JSON.parse(cipher.decrypt(contentData));
  let csc = JSON.stringify(
    { uuid: range[0], data: { id: contentData["id"], title: contentData["title"], tag: contentData["tag"], code: contentData["code"], author: contentData["author"] } },
    "",
    "\t"
  );
  // Logger.log(csc);
  Browser.msgBox(csc);
};

const createtest = () => {
  createMethod(base64.btoa(JSON.stringify(testdata)));
  // readsMethod()
  // readMethod("")
  // updateMethod(["84e94dce-02e1-486a-b3e3-2820b647e664",	"変更",	"2022/12/10",	true])
  // deleteMethod("84e94dce-02e1-486a-b3e3-2820b647e664")
};
function modalCreate() {
  let title = Browser.inputBox("Title");
  let tag = Browser.inputBox("Tag");
  let code = Browser.inputBox("code");
  let author = Browser.inputBox("author");
  let data = [title, tag, code, author];
  if (data.includes("cancel")) return;
  data[1] = tag.split(" ");
  let result = {};
  result["title"] = data[0];
  result["tag"] = data[1];
  result["code"] = data[2];
  result["author"] = data[3];
  let resultText = base64.btoa(JSON.stringify(result));
  createMethod(resultText);
}

const testDataCheck = () => {
  console.log(dataCheck(base64.btoa(JSON.stringify(testdata))));
};

const updatetest = () => {
  updateMethod(["0d5df629-b342-4faf-8ecd-70c5dc841bfa", base64.btoa(JSON.stringify(testdata))]);
};

const readstest = () => {
  let data = readsMethod();
  data = sorter(data);
  console.log(data);
};

const sorter = (array) => {
  let result = array;
  result = result.sort((a, b) => {
    let a_cipher = new cCryptoGS.Cipher(base64.btoa(a[0]), "tripleDES");
    let b_cipher = new cCryptoGS.Cipher(base64.btoa(b[0]), "tripleDES");
    let __a = JSON.parse(a_cipher.decrypt(a[1])).title;
    let __b = JSON.parse(b_cipher.decrypt(b[1])).title;
    return __a.localeCompare(__b);
  });
  return result;
};

const searchTest = () => {
  let sq = { parameter: {} };
  sq["parameter"]["q"] = "";
  let qt = ["pokemon", "dark"];
  sq["parameter"]["qt"] = JSON.stringify(qt);
  console.log(sq);
  doGet(sq);
  console.log("latest 50");
  doGet();
};

const intialzeSheet = () => {
  const file = SpreadsheetApp.openById("1eS19zp0-9BWvpoKDPM7KBykTYgMeiEC7x7pdDb2MwNM");
  const sheet = file.getSheetByName("シート1");
  return sheet;
};

const createMethod = (data) => {
  const sheet = intialzeSheet();
  // ランダムなID生成
  const id = Utilities.getUuid();
  const cipher = new cCryptoGS.Cipher(base64.btoa(id), "tripledes");
  // 今の時間を取得
  const date = new Date();
  const dateString = Utilities.formatDate(date, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS");
  // 引数から入力データを保持
  data = JSON.parse(base64.atob(data));
  data["id"] = id.replaceAll("-", "");
  data = cipher.encrypt(JSON.stringify(data));
  //const taskString = task.toString()
  // 書き込み用データの作成
  const createData = [id, data, dateString, dateString];
  // 最終行の取得
  const lastRow = sheet.getLastRow();
  // 書き込み
  sheet.getRange(lastRow + 1, 1, 1, 4).setValues([createData]);
};
const readsMethod = () => {
  const sheet = intialzeSheet();
  // 最終行の取得
  const lastRow = sheet.getLastRow();
  // getRangeでは0を指定することができなのでデータが存在しないことになる
  if (lastRow <= 1) return;
  // データの取得
  const datas = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  return datas;
};
const readMethod = (id) => {
  const sheet = intialzeSheet();
  // 最終行の取得
  const lastRow = sheet.getLastRow();
  // getRangeでは0を指定することができなのでデータが存在しないことになる
  if (lastRow <= 1) return;
  // データの取得
  const datas = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  // データの検索
  const data = datas.filter((value) => {
    return value[0] == id;
  });
  return data;
};

const updateMethod = (updateData) => {
  const sheet = intialzeSheet();

  // 情報の展開
  let [id, data] = updateData;
  // 最終行の取得
  const lastRow = sheet.getLastRow();
  // getRangeでは0を指定することができなのでデータが存在しないことになる
  if (lastRow <= 1) return;
  // データの取得
  const datas = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
  // データの検索
  const dataIndex = datas.findIndex((value) => {
    return value[0] == id;
  });
  // データがマッチしない場合は除外
  if (dataIndex < 0) return;

  let createdAt = sheet.getRange(dataIndex + 2, 4).getValue();
  const date = new Date();

  const cipher = new cCryptoGS.Cipher(base64.btoa(id), "tripledes");
  data = base64.atob(data);
  data = cipher.encrypt(data);

  const updatedAt = Utilities.formatDate(date, "Asia/Tokyo", "yyyy/MM/dd HH:mm:ss.SSS");
  let _updateData = [id, data, updatedAt, createdAt];
  // データアップデート
  sheet.getRange(dataIndex + 2, 1, 1, 4).setValues([_updateData]);
};
const deleteMethod = (id) => {
  const sheet = intialzeSheet();
  // 最終行の取得
  const lastRow = sheet.getLastRow();
  // getRangeでは0を指定することができなのでデータが存在しないことになる
  if (lastRow <= 1) return;
  // データの取得
  const datas = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  // データの検索
  const dataIndex = datas.findIndex((value) => value == id);
  // データがマッチしない場合は除外
  if (dataIndex < 0) return;
  sheet.deleteRow(dataIndex + 2);
};

const dataCheck = (data) => {
  const incorrectReturnContent = (factor) => {
    let returnContent = { status: false };
    returnContent["content"] = "Incorrect data format: " + factor;
    return returnContent;
  };

  const strFormat = new RegExp(/^(?![\s])[A-Za-z0-9\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]{1,50}$/);
  const tagFormat = new RegExp(/^[A-Za-z0-9_]{1,50}$/);
  const colorFormat = new RegExp(/^(?:#[0-9A-Fa-f]{6},){9}#[0-9A-Fa-f]{6}$/);

  if (!data) return incorrectReturnContent("Null");
  data = JSON.parse(base64.atob(data));
  if (Object.keys(data).length != 4) return incorrectReturnContent("Incorrect format");
  if (!(data.hasOwnProperty("title") && data.hasOwnProperty("tag") && data.hasOwnProperty("code") && data.hasOwnProperty("author"))) return incorrectReturnContent("Missing key");
  if (!strFormat.test(data["title"])) return incorrectReturnContent("Unavailable character types or character counts exceeded (Title)");
  if (!strFormat.test(data["author"])) return incorrectReturnContent("Unavailable character types or character counts exceeded (AuthorName)");
  if (!colorFormat.test(data["code"])) return incorrectReturnContent("Incorrect format (Code)");
  if (!Array.isArray(data["tag"])) return incorrectReturnContent("Incorrect format (Tag)");
  if (data["tag"].filter((e) => !tagFormat.test(e)).length != 0) return incorrectReturnContent("Unavailable character types or character counts exceeded (Tag)");
  return { status: true };
};

function returnJson(json) {
  let returnContent = ContentService.createTextOutput();
  returnContent.setMimeType(ContentService.MimeType.JSON);
  returnContent.setContent(JSON.stringify(json));
  console.log(json);
  return returnContent;
}

function doPost(e) {
  // if(!e) return returnJson({"status":false, "content":"Missing parameter: Undefined"});
  // const param = e.parameter;

  // if(!param.hasOwnProperty('c')) return returnJson({"status":false, "content":"Missing parameter: Content"});
  if (dataCheck(e.postData.contents).status == false) return returnJson(dataCheck(e.postData.contents));

  createMethod(e.postData.contents);
  return returnJson({ status: true });
}

function doGet(e) {
  // if(!e) return returnJson({"status":false, "content":"Missing parameter: Undefined"});
  const param = e ? e.parameter : {};

  let result = [];
  if (!param.hasOwnProperty("q") && !param.hasOwnProperty("qt")) {
    let data = readsMethod();
    data = data.sort((a, b) => b[2] - a[2]);
    data.splice(99, data.length);
    data = data
      .map((e) => {
        let cipher = new cCryptoGS.Cipher(base64.btoa(e[0]), "tripledes");
        return cipher.decrypt(e[1]);
      })
      .sort((a, b) => JSON.parse(a).title.localeCompare(JSON.parse(b).title));
    result = data;
  } else if (param.hasOwnProperty("q") || param.hasOwnProperty("qt")) {
    let data = readsMethod();
    if (param.hasOwnProperty("q"))
      data = data.filter((e) => {
        let cipher = cCryptoGS.Cipher(base64.btoa(e[0]), "tripledes");
        let d = JSON.parse(cipher.decrypt(e[1]));
        return d.title.toLowerCase().includes(param.q.toLowerCase());
      });
    if (param.hasOwnProperty("qt"))
      JSON.parse(param.qt)
        .map((e) => e.toLowerCase())
        .forEach(
          (e) =>
            (data = data.filter((_e) => {
              let cipher = cCryptoGS.Cipher(base64.btoa(_e[0]), "tripledes");
              let d = JSON.parse(cipher.decrypt(_e[1]));
              let t = d.tag;
              t = t.map((__e) => __e.toLowerCase());
              return t.includes(e);
            }))
        );
    data = data.sort((a, b) => b[2] - a[2]);
    data.splice(99, data.length);
    data = data
      .map((e) => {
        let cipher = cCryptoGS.Cipher(base64.btoa(e[0]), "tripledes");
        return cipher.decrypt(e[1]);
      })
      .sort((a, b) => JSON.parse(a).title.localeCompare(JSON.parse(b).title));
    result = data;
  }
  let j = { status: true };
  j["content"] = result;
  return returnJson(j);
}
