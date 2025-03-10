// This file is part of the Prusa Link Web
// Copyright (C) 2021 Prusa Research a.s. - www.prusa3d.com
// SPDX-License-Identifier: GPL-3.0-or-later

import { error, success } from "../toast";
import { handleError } from "../errors";
import { translate } from "../../../locale_provider";
import uploadRequest from "../../../helpers/upload_request";

let isUploading = false;
let progress = 0;

function init(origin, path, projectExtensions) {
  translate("upld.direct.choose", { query: "#upld-direct p", file: projectExtensions.join(", ") });
  initInput(origin, path, projectExtensions);
  if (isUploading) {
    setState("uploading");
    setProgress(progress);
  }
}

function initInput(origin, path, projectExtensions) {
  var input = document.querySelector('#upld-direct input[type="file"]');
  if (input) {
    input.setAttribute("accept", projectExtensions.join(", "));
    input.onchange = () => {
      if (input.files.length > 0 && !isUploading) {
        let file = input.files[0];
        let print = document.getElementById("upld-direct-start-pt")?.checked || false;
        uploadFile(file, origin, path, print);
      }
    }
  }
}

function reset() {
  const input = document.querySelector('#upld-direct input[type="file"]');
  if (input)
    input.value = "";
  setProgress(0);
  setState("choose");
}

function setState(state) {
  isUploading = state === "uploading";
  const el = document.getElementById("upld-direct");
  if (el)
    el.setAttribute("data-state", state);
}

function setProgress(pct) {
  progress = pct;
  const el = document.getElementById("upld-progress");
  if (el)
    el.innerHTML = `${pct} %`;
}

const uploadFile = (file, origin, path, print) => {
  let url = `/api/files/${origin}`;
  var data = new FormData()
  data.append('path', path);
  data.append('file', file);
  data.append('print', print);

  setState("uploading");
  setProgress(0);
  uploadRequest(url, data, {
    onProgress: (progress) => onProgressChanged(progress.percentage)
  }).then(result => onUploadSuccess(file.name))
    .catch(result => onUploadError(file.name, result))
    .finally(() => reset());
}

function onProgressChanged(pct) {
  setState("uploading");
  setProgress(pct);
}

function onUploadSuccess(fileName) {
  const title = translate("ntf.success");
  const message = translate("ntf.upld-suc", { file_name: fileName });
  success(title, message);
}

function onUploadError(fileName, result) {
  if (result) {
    handleError(result);
  } else {
    const title = translate("ntf.error");
    const message = translate("ntf.upld-unsuc", { file_name: fileName });
    error(title, message);
  }
}

export default {
  init,
  get isUploading () {
    return isUploading;
  },
};
