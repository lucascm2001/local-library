const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

// Display list of all BookInstances.
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstance.find({}).populate('book').exec();
  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstance.findById(req.params.id)
    .populate('book')
    .exec();

  if (bookInstance === null) {
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_detail', {
    title: 'Book',
    bookinstance: bookInstance,
  });
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();
  const allStatuses = ['Maintenance', 'Available', 'Loaned', 'Reserved'];

  res.render('bookinstance_form', {
    title: 'Create Book Instance',
    book_list: allBooks,
    all_statuses: allStatuses,
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid Date')
    .optional({ values: 'falsy ' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });
    console.log(bookInstance);

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();
      const allStatuses = ['Maintenance', 'Available', 'Loaned', 'Reserved'];
      res.render('bookinstance_form', {
        title: 'Create Book Instance',
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
        all_statuses: allStatuses,
      });
    } else {
      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookinstance = await BookInstance.findById(req.params.id).exec();

  if (bookinstance === null) {
    res.redirect('/catalog/bookinstances');
  }
  res.render('bookinstance_delete', {
    title: 'Delete Book Instance',
    bookinstance,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstance.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect('/catalog/bookinstances');
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const [bookinstance, allBooks] = await Promise.all([
    BookInstance.findById(req.params.id).exec(),
    Book.find({}, 'title').sort({ title: 1 }).exec(),
  ]);
  const allStatuses = ['Maintenance', 'Available', 'Loaned', 'Reserved'];

  if (bookinstance === null) {
    const err = new Error('Book Instance not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_form', {
    title: 'Update Book Instance',
    bookinstance,
    book_list: allBooks,
    all_statuses: allStatuses,
    selected_book: bookinstance.book._id,
  });
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid Date')
    .isLength({ min: 1 })
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      due_back: req.body.due_back,
      status: req.body.status,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      const allBooks = await Book.find({}).sort({ title: 1 }).exec();
      const allStatuses = ['Maintenance', 'Available', 'Loaned', 'Reserved'];

      res.render('bookinstance_form', {
        title: 'Update Book Instance',
        bookinstance: bookInstance,
        book_list: allBooks,
        all_statuses: allStatuses,
        errors: errors.array(),
      });
    } else {
      const updatedBookInstance = await BookInstance
        .findByIdAndUpdate(req.params.id, bookInstance, {});
      res.redirect(updatedBookInstance.url);
    }
  }),
];
