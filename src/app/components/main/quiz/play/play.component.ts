import { Component, OnInit } from '@angular/core';
import {Question} from '../../../models/Question';
import {FormControl, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material';
import {AnswerModalComponent} from '../../../modals/answer-modal/answer-modal.component';
import {EndOfQuizModalComponent} from '../../../modals/end-of-quiz-modal/end-of-quiz-modal.component';
import {QuizService} from '../../../service/quiz.service';
import {Answer} from '../../../models/Answer';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.sass']
})
export class PlayComponent implements OnInit {

  questionArray: Array<Question>;
  question: Question;
  answerField: any;
  nextQuestion = true;
  public points = 0;
  public reachablePoints: number;
  checked = false;

  constructor(
    public service: QuizService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.questionArray = this.service.Quiz.question;
    this.displayQuestion();
    this.reachablePoints = this.questionArray.length + 1;
  }

  isOpen(): boolean {
    return this.question.questionType.id === 1;
  }

  check() {
    this.checked = true;
    if (this.isOpen()) {
      const antwort = this.answerField.value;
      const richtig = this.question.answer[0].value;
      if (this.compare(antwort, richtig) === 0) {
        this.dialog.open(AnswerModalComponent, {
          width: '400px',
          data: {answer: richtig, result: 'Richtig'}
        });
        this.points += 1;
      } else {
        this.dialog.open(AnswerModalComponent, {
          width: '400px',
          data: {answer: richtig, result: 'Falsch'}
        });
      }
    } else {
      let richtig = true;
      this.question.answer.forEach((a: Answer) => {
        if (!(this.answerField[a.id] === a.outcome.type)) {
          richtig = false;
        }
      });

      let answerString = '';
      let numb = 1;
      this.question.answer.forEach((a: Answer) => {
        answerString += 'Antwort ' + String(numb) + ') ' + a.outcome.type + '.. ';
        numb++;
      });

      if (richtig) {
        this.dialog.open(AnswerModalComponent, {
          width: '400px',
          data: {result: 'Richtig'},
        });
        this.points += 1;
      } else {
        this.dialog.open(AnswerModalComponent, {
          width: '400px',
          data: {result: 'Falsch', answer: answerString},
        });
      }
    }
    this.nextQuestion = true;
  }

  compare(a: string, b: string): number {
    return a.localeCompare(b, 'de', {sensitivity: 'base', ignorePunctuation: true});
  }

  displayQuestion() {
    this.checked = false;
    if (this.service.Quiz.question.length === 0) {
      this.endOfQuiz();
    } else {
      const rand = Math.floor(Math.random() * this.questionArray.length);
      this.question = this.questionArray[rand];
      this.questionArray.splice(rand, 1);
      this.nextQuestion = false;
      this.initValid();
    }
  }

  endOfQuiz() {
    this.nextQuestion = false;
    this.dialog.open(EndOfQuizModalComponent, {
      width: '600px',
      data: {points: this.points, reachable: this.reachablePoints},
      disableClose: true,
    });
  }

  initValid() {
    if (this.isOpen()) {
      this.answerField = new FormControl('', Validators.required);
    } else {
      this.answerField = [];

      this.question.answer.forEach((a: Answer) => {
        this.answerField[a.id] = false;
      });
    }
  }

  canCheck(): boolean {
    if (!this.answerField.valid && this.isOpen() || this.checked) {
      return true;
    }
    return false;
  }

  resetAnswers() {
    if (this.isOpen()) {
      this.answerField.reset();
    }
  }
}
