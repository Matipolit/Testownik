import { ZipReader, BlobReader, BlobWriter } from "@zip.js/zip.js";
import type { FileSystemDirectoryHandle } from "./types";

export function shuffle(array: any[]): void {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

async function processFile(fileData: Blob, fileName: string): Promise<File> {
  const lowerCaseFileName = fileName.toLowerCase();

  if (
    lowerCaseFileName.endsWith(".jpg") ||
    lowerCaseFileName.endsWith(".jpeg") ||
    lowerCaseFileName.endsWith(".png")
  ) {
    // If it's already a File object with the correct name, we can just return it.
    if (fileData instanceof File && fileData.name === fileName) {
      return fileData;
    }
    return new File([fileData], fileName, { type: fileData.type });
  } else {
    const buffer = await fileData.arrayBuffer();
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(buffer);
    } catch (e) {
      console.log("File not in UTF-8, trying windows-1250", fileName);
      text = new TextDecoder("windows-1250").decode(buffer);
    }
    return new File([text], fileName, {
      type: "text/plain",
    });
  }
}

export const openDirectory = async (
  mode: "read" | "readwrite" = "read"
): Promise<File[] | undefined> => {
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
    let directoryStructure: Promise<File[]> | undefined = undefined;

    const getFiles = async (
      dirHandle: FileSystemDirectoryHandle,
      path: string = dirHandle.name
    ): Promise<File[]> => {
      const dirs: Promise<File[]>[] = [];
      const files: Promise<File>[] = [];
      for await (const entry of dirHandle.values()) {
        const nestedPath = `${path}/${entry.name}`;
        if (entry.kind === "file") {
          files.push(
            (entry as FileSystemFileHandle).getFile().then(async (file) => {
              const newFile = await processFile(file, file.name);

              (newFile as any).directoryHandle = dirHandle;
              (newFile as any).handle = entry;
              return Object.defineProperty(newFile, "webkitRelativePath", {
                configurable: true,
                enumerable: true,
                get: () => nestedPath,
              }) as File;
            })
          );
        } else if (entry.kind === "directory") {
          dirs.push(getFiles(entry as FileSystemDirectoryHandle, nestedPath));
        }
      }
      return [
        ...(await Promise.all(dirs)).flat(),
        ...(await Promise.all(files)),
      ];
    };

    try {
      const handle = await window.showDirectoryPicker({
        mode,
      });
      directoryStructure = getFiles(handle);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err.name, err.message);
      }
    }
    return directoryStructure;
  }
  // Fallback if the File System Access API is not supported.
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;

    input.addEventListener("change", async () => {
      if (!input.files) {
        return resolve([]);
      }
      const files = Array.from(input.files);
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const newFile = await processFile(file, file.name);

          Object.defineProperty(newFile, "webkitRelativePath", {
            configurable: true,
            enumerable: true,
            get: () => file.webkitRelativePath,
          });
          return newFile;
        })
      );
      resolve(processedFiles);
    });
    if ("showPicker" in HTMLInputElement.prototype) {
      input.showPicker();
    } else {
      input.click();
    }
  });
};

export async function openZip(
  progressCallback: (progress: number, total: number) => void
): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip"
    input.id = "zipInput";
    input.click();

    input.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      if (!target.files || !target.files[0]) {
        return resolve([]);
      }
      let file = target.files[0];
      const reader = new ZipReader(new BlobReader(file));
      const entries = await reader.getEntries();
      const filesArray: File[] = [];

      let i = 0;
      for (const entry of entries) {
        i += 1;
        progressCallback(i, entries.length);
        if (entry.directory || !entry.getData) {
          continue;
        }

        const blob = await entry.getData(new BlobWriter());
        const fileObject = await processFile(blob, entry.filename);
        filesArray.push(fileObject);
      }

      await reader.close();

      // You can now use the filesArray which contains the files from the zip
      console.log(filesArray);
      resolve(filesArray);
    });
  });
}
