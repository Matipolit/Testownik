export class Question {
  hasImage?: boolean;
  imagePath?: string;
  correctAnswers: boolean[];
  number: number;
  title: string;
  answers: string[];
  constructor(questionFile: string, fileName: string) {
    console.log("Question file: ", questionFile);
    console.log("File name: ", fileName);
    //questionFile = questionFile.replace('\t', '').split('\n');
    let questionFileLines = questionFile.split("\n");
    if (questionFileLines[0].includes(";")) {
      this.hasImage = true;
      const lineSplit = questionFileLines[0].split("=");
      this.imagePath = lineSplit[1].trim();
      this.correctAnswers = getCorrectAnswersFromString(
        lineSplit[0].split(";")[0]
      );
    } else {
      this.correctAnswers = getCorrectAnswersFromString(questionFileLines[0]);
    }
    if (questionFileLines[1].includes("\t")) {
      const titleSplit = questionFileLines[1].split("\t");
      this.number = parseInt(titleSplit[0].split(".")[0]);
      this.title = titleSplit.slice(1).join();
    } else {
      this.title = questionFileLines[1];
      const nameParts = fileName.split("/");
      const actualFileName = nameParts[nameParts.length - 1];
      this.number = parseInt(actualFileName.split(".")[0]);
    }

    this.answers = [];
    let i = 2;
    while (i < questionFileLines.length) {
      if (questionFileLines[i] != "") {
        this.answers.push(questionFileLines[i].replace("\t", ""));
      }
      i++;
    }
  }
}

function getCorrectAnswersFromString(correctString: string): boolean[] {
  let result: boolean[] = [];
  for (let i = 0; i < correctString.length; i++) {
    if (correctString[i] == "1") {
      result.push(true);
    } else if (correctString[i] == "0") {
      result.push(false);
    }
  }
  return result;
}

export interface StoredDb {
  name: string;
  questions: Question[];
  images: [string, string][];
  description: string | null;
}

export interface StoredDbMetadata {
  name: string;
  questionCount: number;
  createdAt: Date;
}

interface FileSystemFileHandle {
  getFile(): Promise<File>;
  name: string;
  kind: "file" | "directory";
}
export interface FileSystemDirectoryHandle {
  name: string;
  kind: "directory";
  values(): AsyncIterable<FileSystemFileHandle | FileSystemDirectoryHandle>;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode: "read" | "readwrite" }): Promise<FileSystemDirectoryHandle>;
  }
  interface HTMLInputElement {
    webkitdirectory: boolean;
  }
}
