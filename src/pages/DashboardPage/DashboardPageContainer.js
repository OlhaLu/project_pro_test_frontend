import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
// import T from 'prop-types';
import questionsSelectors from '../../redux/questions/questionsSelectors';
import questionsActions from '../../redux/questions/questionsActions';
import questionsOperations from '../../redux/questions/questionsOperations';
import DashboardPage from './DashboardPage';

const DashboardPageContainer = ({
  questions,
  isResultSended,
  sendResult,
  check,
  idQuestions,
}) => {
  const [isDisabledBackBtn, setIsDisabledBackBtn] = useState(true);
  const [isDisabledForwardBtn, setIsDisabledForwardBtn] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [result, setResult] = useState(null);

  const increasePageNumber = () => {
    setQuestionNumber(questionNumber + 1);
  };

  const decreasePageNumber = () => {
    setQuestionNumber(questionNumber - 1);
  };

  const isDisableButtons = () => {
    // если questions = null чтобы не было ошибки
    if (!questions) {
      return;
    }
    // // если последний вопрос будет выбран
    // if (questions[questions.length - 1].optionChoosed && !result) {
    //   console.log('last');
    //   getResultFromState(questions);
    // }

    // Disable по кнопкам двойная проверка чтобы не было зацикливания
    if (!questions[questionNumber - 1].optionChoosed && !isDisabledForwardBtn) {
      setIsDisabledForwardBtn(true);
    }

    if (questions[questionNumber - 1].optionChoosed && isDisabledForwardBtn) {
      setIsDisabledForwardBtn(false);
    }

    if (questionNumber > 1 && isDisabledBackBtn) {
      setIsDisabledBackBtn(false);
    }

    if (questionNumber === 1 && !isDisabledBackBtn) {
      setIsDisabledBackBtn(true);
    }
  };

  const getResultFromState = questions => {
    const result = questions.map(question => {
      return {
        examQuestionId: question.id,
        choiceId: question.optionChoosed,
      };
    });
    setResult(result);
  };

  const checkAnswer = (
    examQuestionId,
    choiceId,
    questionNumber,
    questionQuantity,
    choosed,
  ) => {
    // когда последний вопрос, тогда не увеличиваем номер вопроса (increasePageNumber)
    if (questionNumber === questionQuantity) {
      check(examQuestionId, choiceId);
      getResultFromState();
      return;
    }
    // если юзер вернулся чтобы изменить ответ. При изменении не увеличиваем номер вопроса (increasePageNumber)
    if (choosed) {
      check(examQuestionId, choiceId);
      return;
    }

    // делаем задержку на 200 мс, чтобы пользователь видел куда нажал
    setTimeout(() => increasePageNumber(), 200);
    check(examQuestionId, choiceId);
    return;
  };

  const sendResults = () => {
    if (!questions) {
      return;
    }
    console.log('hi');
    sendResult(result, questions[0].examId);
  };

  useEffect(isDisableButtons, [questionNumber]);
  useEffect(sendResults, [result]);

  return (
    // если приходит ответ на put запрос со статусом 204 ==>redirect
    questions && (
      <>
        {isResultSended && isResultSended.status === 204 && (
          <Redirect to="/result" />
        )}
        <DashboardPage
          increaseQuestionNumber={increasePageNumber}
          decreaseQuestionNumber={decreasePageNumber}
          checkAnswer={checkAnswer}
          questionNumber={questionNumber}
          questions={questions}
          isDisabledBackBtn={isDisabledBackBtn}
          isDisabledForwardBtn={isDisabledForwardBtn}
        />
      </>
    )
  );
};

const mapStateToProps = state => {
  return {
    idQuestions: questionsSelectors.getIdQuestions(state),
    questions: questionsSelectors.getQuestions(state),
    err: questionsSelectors.getError(state),
    isResultSended: questionsSelectors.getIsResultSended(state),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    check: (examQuestionId, choiceId) =>
      dispatch(questionsActions.checkAnswer(examQuestionId, choiceId)),
    sendResult: (result, examId) =>
      dispatch(questionsOperations.sendResult(result, examId)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardPageContainer);

// class DashboardPageContainer extends Component {
//   static defaultProps = {
//     err: null,
//     isResultSended: {},
//   };

//   static propTypes = {
//     err: T.string,
//     questions: T.arrayOf(
//       T.shape({
//         id: T.string.isRequired,
//         examId: T.string.isRequired,
//         question: T.string.isRequired,
//         choices: T.arrayOf(
//           T.shape({
//             id: T.number.isRequired,
//             title: T.string.isRequired,
//           }).isRequired,
//         ),
//       }).isRequired,
//     ),

//     check: T.func.isRequired,
//     sendResult: T.func.isRequired,
//   };

//   state = {
//     isDisabledBackBtn: true,
//     isDisabledForwardBtn: true,
//     result: null,
//     questionNumber: 1,
//   };

//   timerId = null;

//   componentDidUpdate() {
//     const { questions, sendResult, isResultSended } = this.props;
//     const {
//       isDisabledBackBtn,
//       isDisabledForwardBtn,
//       result,
//       questionNumber,
//     } = this.state;
//     // если последний элемент выбран => со стейта забираем значения
//     if (questions[questions.length - 1].optionChoosed && !result) {
//       this.getResultFromState(questions);
//     }
//     // делаем put запрос
//     if (result && !isResultSended) {
//       sendResult(result, questions[0].examId);
//     }

//     // Disable по кнопкам двойная проверка чтобы не было зацикливания
//     if (!questions[questionNumber - 1].optionChoosed && !isDisabledForwardBtn) {
//       this.setState({
//         isDisabledForwardBtn: true,
//       });
//     }

//     if (questions[questionNumber - 1].optionChoosed && isDisabledForwardBtn) {
//       this.setState({
//         isDisabledForwardBtn: false,
//       });
//     }

//     if (questionNumber > 1 && isDisabledBackBtn) {
//       this.setState({
//         isDisabledBackBtn: false,
//       });
//     }

//     if (questionNumber === 1 && !isDisabledBackBtn) {
//       this.setState({
//         isDisabledBackBtn: true,
//       });
//     }
//   }

//   //снимаем setTimeout
//   componentWillUnmount() {
//     clearTimeout(this.timerId);
//   }

//   getResultFromState = questions => {
//     const result = questions.map(question => {
//       return {
//         examQuestionId: question.id,
//         choiceId: question.optionChoosed,
//       };
//     });
//     this.setState({
//       result: {
//         answers: result,
//       },
//     });
//   };

//   increasePageNumber = () => {
//     this.setState(prevState => {
//       return {
//         questionNumber: prevState.questionNumber + 1,
//       };
//     });
//   };

//   decreasePageNumber = () => {
//     this.setState(prevState => {
//       return {
//         questionNumber: prevState.questionNumber - 1,
//       };
//     });
//   };

//   checkAnswer = (
//     examQuestionId,
//     choiceId,
//     questionNumber,
//     questionQuantity,
//     choosed,
//   ) => {
//     // получаем check с редакса
//     const { check } = this.props;
//     // когда последний вопрос, тогда не увеличиваем номер вопроса (increasePageNumber)
//     if (questionNumber === questionQuantity) {
//       check(examQuestionId, choiceId);
//       return;
//     }
//     // если юзер вернулся чтобы изменить ответ. При изменении не увеличиваем номер вопроса (increasePageNumber)
//     if (choosed) {
//       check(examQuestionId, choiceId);
//       return;
//     }

//     // делаем задержку на 200 мс, чтобы пользователь видел куда нажал
//     this.timerId = setTimeout(() => this.increasePageNumber(), 200);
//     check(examQuestionId, choiceId);
//     return;
//   };

//   render() {
//     const { questions, isResultSended } = this.props;
//     const {
//       isDisabledBackBtn,
//       isDisabledForwardBtn,
//       questionNumber,
//     } = this.state;

//     return (
//       // если приходит ответ на put запрос со статусом 204 ==>redirect
//       questions && (
//         <>
//           {isResultSended && isResultSended.status === 204 && (
//             <Redirect to="/result" />
//           )}
//           <DashboardPage
//             increaseQuestionNumber={this.increasePageNumber}
//             decreaseQuestionNumber={this.decreasePageNumber}
//             checkAnswer={this.checkAnswer}
//             questionNumber={questionNumber}
//             questions={questions}
//             isDisabledBackBtn={isDisabledBackBtn}
//             isDisabledForwardBtn={isDisabledForwardBtn}
//           />
//         </>
//       )
//     );
//   }
// }
