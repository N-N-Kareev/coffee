import React from "react";
import css from './oferta.module.css'; // импортируйте стили

const OfertaPage = () => {
  return (
    <div className={css.container}>
      <h1 className={css.title}>ПУБЛИЧНАЯ ОФЕРТА</h1>
      <section className={css.section}>
        <h2 className={css.subtitle}>Общие положения</h2>
        <p>
          В настоящей Публичной оферте содержатся условия заключения Договора об оказании услуг
          (далее по тексту - «Договор об оказании услуг» и/или «Договор»). Настоящей офертой признается
          предложение, адресованное одному или нескольким конкретным лицам, которое достаточно
          определенно и выражает намерение лица, сделавшего предложение, считать себя заключившим
          Договор с адресатом, которым будет принято предложение.
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Термины и определения</h2>
        <p>
          <strong>Договор</strong> – текст настоящей Оферты с Приложениями, являющимися неотъемлемой частью
          настоящей Оферты, акцептованный Заказчиком путем совершения конклюдентных действий, предусмотренных
          настоящей Офертой.
        </p>
        <p>
          <strong>Сайт Исполнителя</strong> – <a href="https://coffee-hec1.vercel.app/pages/menu" className={css.link}>https://coffee-hec1.vercel.app/pages/menu</a>
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Предмет договора</h2>
        <p>
          Исполнитель обязуется оказать Заказчику Услуги, а Заказчик обязуется оплатить их в размере, порядке
          и сроки, установленные настоящим Договором.
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Права и обязанности сторон</h2>
        <p>
          Исполнитель обязуется оказывать услуги в соответствии с условиями договора и обеспечивать
          конфиденциальность данных Заказчика.
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Цена и порядок расчетов</h2>
        <p>
          Стоимость услуг Исполнителя определяется на основании сведений Исполнителя при оформлении заявки
          Заказчиком либо устанавливается на <a href="https://coffee-hec1.vercel.app/pages/menu" className={css.link}>сайте Исполнителя</a>.
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Конфиденциальность и безопасность</h2>
        <p>
          Стороны обязуются сохранять конфиденциальность информации, полученной в ходе исполнения настоящего
          Договора, и принять все возможные меры, чтобы предохранить полученную информацию от разглашения.
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Форс-мажор</h2>
        <p>
          Стороны освобождаются от ответственности за неисполнение обязательств по Договору в случае
          чрезвычайных и непредотвратимых обстоятельств.
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Ответственность Сторон</h2>
        <p>
          В случае неисполнения и/или ненадлежащего исполнения обязательств по Договору, стороны несут
          ответственность в соответствии с условиями настоящей Оферты.
        </p>
      </section>
      <section className={css.section}>
        <h2 className={css.subtitle}>Реквизиты Исполнителя</h2>
        <p>
          <strong>Полное наименование:</strong> Пономарев Александр Игоревич
        </p>
        <p>
          <strong>ИНН:</strong> 616712086883
        </p>
        <p>
          <strong>ОГРН/ОГРНИП:</strong> 323619600018672
        </p>
        <p>
          <strong>Контактный телефон:</strong> +7 961 414-11-30
        </p>
        <p>
          <strong>Контактный e-mail:</strong> aprnd95@gmail.com
        </p>
      </section>
    </div>
  );
};

export default OfertaPage;
