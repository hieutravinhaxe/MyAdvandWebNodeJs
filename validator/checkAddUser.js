const { check } = require('express-validator')

const validator = [
    check('Email')
    .exists().withMessage('Vui lòng cung cấp email')
    .notEmpty().withMessage('Không được để trống email')
    .isEmail().withMessage('Địa chỉ email không hợp lệ'),

    check('Password')
    .exists().withMessage('Vui lòng cung cấp password')
    .notEmpty().withMessage('Không được để trống password')
    .isLength({ min: 6 }).withMessage('mật khẩu phải dài hơn 6 kí tự'),

    check('Name')
    .exists().withMessage('Vui lòng cung cấp Username')
    .notEmpty().withMessage('Không được để trống Username'),

    check('Role')
    .exists().withMessage('Vui lòng cung cấp phân quyền')
    .notEmpty().withMessage('Không được để trống phân quyền')
    .isLength({ min: 1 }).withMessage('Chưa chọn phân quyền'),
]

module.exports = validator