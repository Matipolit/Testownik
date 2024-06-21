import {ZipReader, BlobReader, BlobWriter} from "@zip.js/zip.js"

export const openDirectory = async (mode = "read") => {
  // Feature detection. The API needs to be supported
  // and the app not run in an iframe.
  const supportsFileSystemAccess =
    "showDirectoryPicker" in window &&
    (() => {
      try {
        return window.self === window.top;
      } catch {
        return false;
      }
    })();
  // If the File System Access API is supported…
  if (supportsFileSystemAccess) {
    let directoryStructure = undefined;

    const getFiles = async (dirHandle, path = dirHandle.name) => {
      const dirs = [];
      const files = [];
      for await (const entry of dirHandle.values()) {
        const nestedPath = `${path}/${entry.name}`;
        if (entry.kind === "file") {
          files.push(
            entry.getFile().then((file) => {
              file.directoryHandle = dirHandle;
              file.handle = entry;
              return Object.defineProperty(file, "webkitRelativePath", {
                configurable: true,
                enumerable: true,
                get: () => nestedPath,
              });
            })
          );
        } else if (entry.kind === "directory") {
          dirs.push(getFiles(entry, nestedPath));
        }
      }
      return [
        ...(await Promise.all(dirs)).flat(),
        ...(await Promise.all(files)),
      ];
    };

    try {
      const handle = await showDirectoryPicker({
        mode,
      });
      directoryStructure = getFiles(handle, undefined);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err.name, err.message);
      }
    }
    return directoryStructure;
  }
  // Fallback if the File System Access API is not supported.
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.webkitdirectory = true;

    input.addEventListener('change', () => {
      let files = Array.from(input.files);
      resolve(files);
    });
    if ('showPicker' in HTMLInputElement.prototype) {
      input.showPicker();
    } else {
      input.click();
    }
  });
};

export async function openZip(progressCallback){

  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip"
    input.id = "zipInput"
    input.click();

    input.addEventListener("change", async () => {
      let file = event.target.files[0];
      if (!file){
        resolve([]);
      }
      const reader = new ZipReader(new BlobReader(file));
      const entries = await reader.getEntries();
      const filesArray = [];

      let i = 0;
      for (const entry of entries) {
        i += 1;
        progressCallback(i, entries.length);
        if (entry.directory) {
          continue;
        }

        const blob = await entry.getData(new BlobWriter());
        const fileObject = new File([blob], entry.filename, { type: blob.type });
        filesArray.push(fileObject);
      }

      await reader.close();

      // You can now use the filesArray which contains the files from the zip
      console.log(filesArray);
      resolve(filesArray);
      })
  });
}

function getCorrectAnswersFromString(correctString){
  let result = [];
  for(let i = 0; i < correctString.length; i++){
    if(correctString[i] == '1'){result.push(true);}
    else if(correctString[i] == '0'){result.push(false);}
  }
  return result;
}

export class Question {
  constructor(questionFile, fileName) {
    //questionFile = questionFile.replace('\t', '').split('\n');
    questionFile = questionFile.split('\n');
    if(questionFile[0].includes(";")){
      this.hasImage = true;
      const lineSplit = questionFile[0].split("=");
      this.imagePath = lineSplit[1].trim();
      this.correctAnswers = getCorrectAnswersFromString(lineSplit[0].split(";")[0]);
    }else{
      this.correctAnswers = getCorrectAnswersFromString(questionFile[0]);
    }
    if(questionFile[1].includes("\t")){
      const titleSplit = questionFile[1].split("\t");
      this.number = parseInt(titleSplit[0].split(".")[0]);
      this.title = titleSplit.slice(1).join();
    }else{
      this.title = questionFile[1];
      this.number = parseInt(fileName.split(".")[0]);
    }

    this.answers = [];
    let i = 2;
    while (i < questionFile.length){
      if(questionFile[i]!=""){
        this.answers.push(questionFile[i].replace('\t', ''));
      }
      i++;
    }
  }
}
