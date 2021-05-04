"use strict";

function validateText(inputText, regexp) {
	if(typeof inputText === "string") {
		if(inputText.match(regexp)) {
			return false;
		} else {
			return true;
		}
	} else {
		return false;
	}
}

const authVueApp = new Vue({
	el: "#app_main",
	delimiters: ["[[", "]]"],
	data: {
		login_icon: "static/task_manager_static/img/info_icon.svg",
		password_icon: "static/task_manager_static/img/info_icon.svg",
		authLoginClass: "auth-input",
		authPasswordClass: "auth-input",
		SubmitStatus: "Войти",
		loginHelpText: "",
		passwordHelpText: "",
		loginInput: "",
		passwordInput: "",
		submitDisabled: true,
		is_loading: false
	},
	watch: {
		loginInput: function() {
			this.validate();
		},
		passwordInput: function() {
			this.validate();
		}
	},

	methods: {
		validate_login: function() {
			if(!this.loginInput.trim()) {
				this.loginHelpText = "Поле 'Логин' не должно быть пустым";
			} else {
				this.loginHelpText = "";
				this.authLoginClass = "auth-input";
				return true;
			}
			this.authLoginClass = "auth-input auth-input-errored";
			return false;
		},
		validate_password: function() {
			if(!this.passwordInput.trim()) {
				this.passwordHelpText = "Поле 'Пароль' не должно быть пустым";
			} else {
				this.passwordHelpText = "";
				this.authPasswordClass = "auth-input";
				return true;
			}
			this.authPasswordClass = "auth-input auth-input-errored";
			return false;
		},
		validate: function() {
			if(this.validate_login() & this.validate_password()) {
				this.submitDisabled = false;
				return true;
			} else {
				this.submitDisabled = true;
				return false;
			}
		},
		sendAuthsRequest: async function(e) {
			e.preventDefault();
			if(!authVueApp.validate()) {
				return;
			} else {
				this.submitDisabled = true;
				this.is_loading = true;
				this.SubmitStatus = "Попытка входа..."
				const uploadData = JSON.stringify({
					username: this.loginInput,
					password: this.passwordInput,
				});
				await axios.post("./auths_in" , uploadData, {
					headers: {
						"X-CSRFToken": getCookie("csrftoken")
					}
				})
				.then(function (response) {
					if(response.status === 200) {
						document.location.reload();
					}
				})
				.catch(function (error) {
					authVueApp.SubmitStatus = "Войти";
					authVueApp.is_loading = false;
					switch(error.response.status) {
						case 404:
							authVueApp.authLoginClass = "auth-input auth-input-errored";
							authVueApp.authPasswordClass = "auth-input auth-input-errored";
							authVueApp.loginHelpText = "Неправильный логин или пароль";
						case 400:
							authVueApp.authLoginClass = "auth-input auth-input-errored";
							authVueApp.authPasswordClass = "auth-input auth-input-errored";
							authVueApp.loginHelpText = "Неверный ввод данных";
					}
				});
			}
		}
	},
	
});

