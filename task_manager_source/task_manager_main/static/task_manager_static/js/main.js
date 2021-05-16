"use strict";

const fileThumbnailsSrc = {
	"img": "static/task_manager_static/img/image_icon.svg",
	"undefinedFile": "static/task_manager_static/img/file_icon.svg",
	"archive": "static/task_manager_static/img/archive_icon.svg",
	"text": "static/task_manager_static/img/text_icon.svg",
}

async function getCurrentUserProfile() {
	axios.get("auths_get").then(function(response) {
		mainTaskApp.user_profile = response.data.data;
	}).catch(function (err) {
		console.error(err);
	})
}

async function getStatuses() {
	axios.get("api/status/?format=json").then(function(response) {
		mainTaskApp.selection_items = response.data.results
	}).catch(function (err) {
		console.error(err);
	}) 
}

async function getAllUsersProfiles() {
	axios.get("api/profile/?format=json").then(function(response) {
		mainTaskApp.user_profiles = response.data.results;
	}).catch(function (err) {
		console.error(err);
	})
}

const mainTaskApp = new Vue({
	delimiters: ["[[", "]]"],
	el: "#main_app_wrapper_",
	data: {
		user_profile: null, // Профиль текущего пользователя
		user_profiles: [], // Профили всех пользователей

		is_loading: false, // блокировка экрана (экран закрузки вкл/выкл)
		show_logout: false, // Показать модальное окно выхода из профиля
		statuses_loaded: false, // Данные с сервера загружены

		active_component: null, // Активный комнонент Vue для отображения содержимого вкладки
		current_active_item: null, // Текущая открытая вкладка

		selection_items: [], // Список выбора статусов работы

		manager_settings: { // Настройки работы mainTaskApp и его компонентов
			functional_hotbar_items_max: 1, // Индекс последнего функционально элемента хотбара (не являющийся задачей)
		},

		tasks_list_component: {

		},

		task_list: [
		]	// Список вкладок
	},
	mounted() {
		this.prepare_new_task();
		this.tasks_list_component = {
			is: mainListTab("tab_all_shedule"),
		};
		this.current_active_item = 0;
		this.active_component = this.tasks_list_component;
	},
	methods: {
		open_task_tab: function(task_id) {
			this.current_active_item = this.create_task_tab(task_id);
			this.active_component = this.build_component_props();
		},
		select_tab: function(index) {
			this.is_loading = true;
			this.current_active_item = index;
			if(index == 0) {
				this.active_component = this.tasks_list_component;
			}
			else if(index == 1) {
				this.current_active_item = this.create_task_tab();
				this.active_component = this.build_component_props();
			} else if(index > this.manager_settings.functional_hotbar_items_max) {
				this.active_component = this.build_component_props();
			}
			this.is_loading = false;
		},
		create_task_tab: function(open_task_id) {
			let new_tab_id = this.task_list.length + 2;
			let new_component;
			if(open_task_id) {
				new_component = new createTaskTab("tab_" + new_tab_id, open_task_id);
			} else {
				new_component = new createTaskTab("tab_" + new_tab_id);
			}

			this.task_list.push(
				{
					name: open_task_id ? "Задача #" + open_task_id : "Новая задача",
					tab_id: new_tab_id,
					tab_component: Vue.component(new_component.name, new_component)
				}
			);

			return new_tab_id;
		},
		close_tab: function(tab_item) {
			this.task_list.splice(this.task_list.indexOf(tab_item), 1);
			this.current_active_item = null;
			this.active_component = null;
		},
		build_component_props: function() {
			return {
				is: "tab_" + this.current_active_item,
				user_profiles: this.user_profiles,
				user_profile: this.user_profile,
				selection_items: this.selection_items,
				current_active_item: this.current_active_item
			}
		},
		
		confirm_logout: function() {		
			this.show_logout = true;
		},

		logout_confirmed: function() {
			this.show_logout = false;
			this.is_loading = true;
			axios.get("./auths_out").then(function (response) {
				if(response.status == 200) {
					document.location.reload();
				}
			}).catch(function (err) {
				mainTaskApp.is_loading = false;
			})
		},

		logout_declined: function() {
			this.show_logout = false;
		},

		async prepare_new_task() {
			this.is_loading = true;
			if(!this.statuses_loaded) {
				await getCurrentUserProfile()
						.then(getStatuses())
						.then(getAllUsersProfiles())
						.finally(function() {
							mainTaskApp.statuses_loaded = true;
							mainTaskApp.is_loading = false;

						});
				
			}
		}

	}
});

