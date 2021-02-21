// Hàm validator
function Validator(options) {
	var selectorRules = {};

	// Hàm kiểm tra đúng luật
	function validate(inputElement, rule) {
		var errorMessage;
		var errorElement = inputElement.parentElement.querySelector(
			`.${options.error}`
		);

		var rules = selectorRules[rule.selector];

		// Vòng lặp để kiểm tra nếu có lỗi thì dừng lại
		for (let i = 0; i < rules.length; i++) {
			errorMessage = rules[i](inputElement.value);
			if (errorMessage) break;
		}

		// Điều kiện nếu có lỗi thì thêm class và text báo lỗi
		if (errorMessage) {
			errorElement.innerText = errorMessage;
			inputElement.parentElement.classList.add('invalid');
		} else {
			errorElement.innerText = '';
			inputElement.parentElement.classList.remove('invalid');
		}

		return !errorMessage;
	}

	// Lấy element form
	var formElement = document.querySelector(options.form);

	// Kiểm tra element form có tồn tại
	if (formElement) {
		formElement.onsubmit = function (e) {
			e.preventDefault();

			var isFormValid = true;

			// Vòng lặp để kiểm tra có input nào lỗi/ thiếu dữ liệu
			options.rules.forEach(function (rule) {
				var inputElement = formElement.querySelector(rule.selector);
				var isValid = validate(inputElement, rule);

				if (!isValid) {
					isFormValid = false;
				}
			});

			// Kiểm tra tính đúng sai của form sau kiểm tra
			if (isFormValid) {
				// Kiểm tra dữ liệu của onSubmit, nếu function thì gửi nhưng không reload
				if (typeof options.onSubmit === 'function') {
					var enableInputs = formElement.querySelectorAll(
						'[name]:not([disabled])'
					);

					// Form để lấy dữ liệu từ các input
					var formValue = Array.from(enableInputs).reduce((value, input) => {
						return (value[input.name] = input.value) && value;
					}, {});

					options.onSubmit(formValue);
				}

				// Nếu onSubmit không phải function thì submit theo truyền thống
				else {
					formElement.submit();
				}
			}
		};

		// Chạy vòng lặp để thêm rule
		options.rules.forEach(function (rule) {
			// Kiểm tra array, nếu đúng thì push vào sẵn có
			if (Array.isArray(selectorRules[rule.selector])) {
				selectorRules[rule.selector].push(rule.test);
			}
			// Còn không thì tạo mới một object trong mảng
			else {
				selectorRules[rule.selector] = [rule.test];
			}

			var inputElement = formElement.querySelector(rule.selector);
			var errorElement = inputElement.parentElement.querySelector(
				`.${options.error}`
			);

			// Kiểm tra inputElement có tồn tại để thêm sự kiên onblur và oninput
			if (inputElement) {
				inputElement.onblur = function () {
					validate(inputElement, rule);
				};

				inputElement.oninput = function () {
					if (inputElement.value) {
						errorElement.innerText = '';
						inputElement.parentElement.classList.remove('invalid');
					}
				};
			}
		});
	}
}

// isRequired để kiểm tra input có bỏ trống hay không
Validator.isRequired = function (selector, message) {
	return {
		selector: selector,
		test: function (value) {
			return value.trim() ? undefined : message || 'Vui lòng nhập trường này';
		},
	};
};

// isEmail để kiểm tra input email có hợp lệ
Validator.isEmail = function (selector) {
	return {
		selector: selector,
		test: function (value) {
			const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return regex.test(value) ? undefined : 'Email không hợp lệ!';
		},
	};
};

// minLength để kiểm tra độ dài tối thiểu của input
Validator.minLength = function (selector, min) {
	return {
		selector: selector,
		test: function (value) {
			return value.length >= min
				? undefined
				: `Mật khẩu tối thiểu từ ${min} ký tự`;
		},
	};
};

// isConfirm để kiểm tra giống nhau giữa 2 trường input
Validator.isConfirm = function (selector, getConfirmValue, message) {
	return {
		selector: selector,
		test: function (value) {
			return value === getConfirmValue()
				? undefined
				: message || 'Giá trị nhập vào không chính xác';
		},
	};
};
