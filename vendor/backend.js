document.addEventListener("DOMContentLoaded", (event) => {
  //console.log('backend.js from front')

  $(window).scroll(function () {
    if ($(this).scrollTop() < 40) {
      $("header").removeClass("hide-top");
    } else {
      $("header").addClass("hide-top");
    }
  });

  /* ====   Реализация отправки данных с форм регистрации на мероприятие и анкеты   ==== */

  /* Отправка данных двух форм на сервер */
  const registrationForm = document.querySelector(".js-event-form");
  const registrationModalForm = document.querySelector(
    ".modal-registration__form",
  );

  if (!registrationForm || !registrationModalForm) return;

  /* Отправкой данных будет заниматься форма в модальном окне с анкетой */
  registrationModalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let $form = $(registrationModalForm),
      $btn = $form.find('button[type="submit"]'),
      key = $("#recaptcha-public").val();

    if (!$form.hasClass("loading")) {
      $form.addClass("loading");
      $btn.attr("disabled", true);

      grecaptcha.ready(function () {
        grecaptcha
          .execute(key, {
            action: "sendform",
          })
          .then(function (token) {
            $(registrationForm)
              .find('[name="g-recaptcha-response"]')
              .val(token);

            /* Инициализация данных форм и их объединение в один объект */
            const registrationFormData = new FormData(registrationForm);
            const registrationModalFormData = new FormData(
              registrationModalForm,
            );
            const combinedFormData = Object.assign(
              registrationFormData,
              registrationModalFormData,
            );

            let formData = new FormData(registrationForm);
            let formDataPrecios = new FormData(registrationModalForm);
            let count = 0;
            for (var pair of formDataPrecios.entries()) {
              formData.append("asking[" + count + "][QuestionId]", pair[0]);
              formData.append("asking[" + count + "][AnswerId]", pair[1]);
              count++;
            }

            /* Путь к php-файлу берется из формы с анкетой */
            const url = registrationModalForm.getAttribute("action");

            /* Отправляем запрос и обрабатываем ответ. В зависимости от ответа открываем соотв. модалку. */
            axios
              .post(url, formData)
              .then((response) => {
                if (response.data.recording === true) {
                  const emailInputValue = registrationForm.querySelector(
                    'input[type="email"]',
                  ).value;
                  const emailSpan = document.querySelector(
                    ".modal-registration-success .js-email",
                  );
                  emailSpan.textContent = emailInputValue;

                  if ($form.data("form-success").length) {
                    let email = $form.data("form-success");
                    $(".js-email-support")
                      .attr("href", "mailto:" + email)
                      .text(email);
                  }

                  window.rdv_API.modal.close();
                  window.rdv_API.modal.onOpen("registration-success");
                } else {
                  window.rdv_API.modal.close();
                  window.rdv_API.modal.onOpen("error");
                  $(".modal-error .modal-error__desc").text(
                    response.data.errors,
                  );
                }

                $form.removeClass("loading");
                $btn.attr("disabled", false);
              })
              .catch((error) => {
                console.log(error.message);
                window.rdv_API.modal.close();
                window.rdv_API.modal.onOpen("error");

                $form.removeClass("loading");
                $btn.attr("disabled", false);
              });
          });
      });
    }
  });

  /* ====   Формирование анкеты формы через json   ==== */

  /* Беру данные для формирования урла из разметки */
  const jsonUrl = registrationForm.dataset.json;
  const eventId = registrationForm.querySelector('input[name="eventId"]');

  if (eventId.value == "") return;

  /* Фомирую урл */
  const url = `${jsonUrl}?${eventId.name}=${eventId.value}`;

  /* Нахожу контейнер анкеты, чтобы потом присвоить ему класс для работы с табами */
  const registrationContainer = document.querySelector(
    ".js-registration-container",
  );

  /* Template блока с вопросом для формирования разметки */
  const questionTemplate =
    registrationModalForm.querySelector("#eventQuestionTemp");

  const formGroup = questionTemplate.content.querySelector(
    ".modal-registration__form-group",
  );
  const questionTitle = questionTemplate.content.querySelector(
    ".modal-registration__question",
  );
  const answersWrapper = questionTemplate.content.querySelector(
    ".modal-registration__answers",
  );
  const answersLeft = questionTemplate.content.querySelector(
    ".modal-registration__answers-left",
  );
  const answersRight = questionTemplate.content.querySelector(
    ".modal-registration__answers-right",
  );
  const navigationButtons = questionTemplate.content.querySelector(
    ".modal-registration__buttons",
  );

  /* Template поля с ответом для формирования разметки */
  const answerTemplate =
    registrationModalForm.querySelector("#eventAnswerTemp");

  const answerInput = answerTemplate.content.querySelector(
    ".modal-registration__input",
  );
  const answerLabel = answerTemplate.content.querySelector(
    ".modal-registration__label",
  );

  /* Тестовый запрос к файлу events.json (заменить на url) */
  fetch(url)
    .then((res) => res.json())
    .then((json) => {
      //if(!json.success) return;

      /* Перебираю все вопросы */
      const questions = json.question;

      if (!questions) {
        $("#formEvent").removeClass("js-event-form");
        $("#formEvent").addClass("js-form-send-home js-form-send-home-event");
        $('#formEvent [name="useQuestionnary"]').attr("value", "N");

        throw new Error("The questionnaire is empty");
      }

      questions.forEach((question, index) => {
        /* Дают первому табу класс active */
        if (index === 0) {
          formGroup.classList.add("active");
        } else {
          formGroup.classList.remove("active");
        }

        /* Подставляю данные для табов и вопроса из json-файла */
        formGroup.dataset.id = `answerTab${index}`;
        questionTitle.textContent = question.name;

        /* В зависимости от количества ответов формирую сетку. Если вопросов больше пяти, то вопросы делятся на 2 колонки */
        const answersLeftArr = question.answers.slice(
          0,
          question.answers.length / 2 + 1,
        );
        const answersRightArr = question.answers.slice(
          question.answers.length / 2 + 1,
        );
        answersLeft.innerHTML = "";
        answersRight.innerHTML = "";

        if (question.answers.length < 5) {
          answersWrapper.classList.add(
            "modal-registration__answers--single-column",
          );

          answersLeftArr.forEach((answer) => {
            answerInputAdd(question, answer, answersLeft);
          });

          answersRightArr.forEach((answer) => {
            answerInputAdd(question, answer, answersLeft);
          });
        } else {
          answersWrapper.classList.remove(
            "modal-registration__answers--single-column",
          );

          answersLeftArr.forEach((answer) => {
            answerInputAdd(question, answer, answersLeft);
          });

          answersRightArr.forEach((answer) => {
            answerInputAdd(question, answer, answersRight);
          });
        }

        /* Добавляю кнопки навигации в зависимости от того, на каком шаге находится пользователь. */
        let navigationButton;
        navigationButtons.innerHTML = "";

        if (index > 0) {
          navigationButton = document.createElement("button");
          navigationButton.className =
            "modal-registration__button button button--medium button--bordered js-tab";
          navigationButton.type = "button";
          navigationButton.dataset.href = `answerTab${index - 1}`;
          navigationButton.textContent = "Назад";

          navigationButtons.append(navigationButton);
        }

        if (index + 1 < questions.length) {
          navigationButton = document.createElement("button");
          navigationButton.className =
            "modal-registration__button button button--medium button--blue js-tab";
          navigationButton.type = "button";
          navigationButton.dataset.href = `answerTab${index + 1}`;
          navigationButton.textContent = "Далее";
          navigationButton.disabled = true;

          navigationButtons.append(navigationButton);
        }

        if (index + 1 === questions.length) {
          navigationButton = document.createElement("button");
          navigationButton.className =
            "modal-registration__button button button--medium button--blue";
          navigationButton.type = "submit";
          navigationButton.textContent = "Завершить";
          navigationButton.disabled = true;

          navigationButtons.append(navigationButton);
        }

        /* Добавляю получившийся блок вопроса в разметку */
        const questionBlock = questionTemplate.content.cloneNode(true);
        registrationModalForm.append(questionBlock);

        /* Присваиваю для контейнера класс для работы с табами */
        registrationContainer.classList.add("js-tabs-container");
      });
    })
    .then(() => {
      /* После формировании разметки запускаю все функции, связанные с анкетой */
      window.initTabs();
      window.initRegistrationForm();
      window.initSimpleBar();
    })
    .catch((err) => {
      console.error(err);
    });

  /* Функция для создания поля с вопросом. */
  function answerInputAdd(question, answer, answerColumn) {
    answerInput.type = question.isMultiple ? "radio" : "checkbox";
    answerInput.name = question.id;
    answerInput.id = answer.id;
    answerInput.value = answer.id;

    answerLabel.textContent = answer.name;
    answerLabel.htmlFor = answer.id;

    const answerEl = answerTemplate.content.cloneNode(true);
    answerColumn.append(answerEl);
  }
});
