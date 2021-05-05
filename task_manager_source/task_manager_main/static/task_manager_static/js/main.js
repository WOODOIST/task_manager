"use strict";

const hotbarItems = document.querySelector(".header-hotbar-part").children;
const selectionBox = document.querySelector("#statusSelection");


async function createSelection() {
	axios.get("api/status/?format=json").then(function (response) {
		for(let i = 0; i < response.data.results.length; i++) {
			let newOption = document.createElement("option");
			selectionBox.append(newOption);
			newOption.value = response.data.results[i].name;
			newOption.textContent = response.data.results[i].name;
			
			let newOptionObject = {};
			newOptionObject.name = response.data.results[i].name;
			newOptionObject.color = response.data.results[i].color;

			let exists = 0;
			for(let c = 0; c < mainTaskApp.selection_items.length; c++) {
				if(mainTaskApp.selection_items[c].name == newOptionObject.name) {
					exists = 1;
					break;
				}
			}
			if(!exists) {
				mainTaskApp.selection_items.push(newOptionObject);
			}
		}
	}).catch(function (err) {
		console.error(err);
	});
}

async function getCurrentUserProfile() {
	axios.get("auths_get").then(function(response) {
		mainTaskApp.user_profile = response.data.data;
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
		user_profile: null,
		choosen_assignee: "Выбрать исполнителя",
		user_profiles: [],

		is_loading: false,
		show_logout: false,
		statuses_loaded: false,
		is_assignee_choosing_modal_active: false,
		is_even_clearing_enabled: false,

		is_popup_active: false,
		clear_confirm_class: "clear-form-confirm clear-hidden",

		current_active_item: "",
		current_option_item: "",

		selectStyleObject: {
			background: "",
		},

		selection_items: [],

		hotbar_classes: {
			task_pool: "hotbar-item",
			new_task: "hotbar-item"
		},

		new_task: {
			status: null,
			title: null,
			description: null,
			assignee: null,
			date_begin: {
				date: null,
				time: null,
			},
			date_end: {
				date: null,
				time: null,
			},
			commentary: null
		},
	},
	watch: {
		current_active_item: function() {
			for(let [key, value] of Object.entries(this.hotbar_classes)) {
				this.hotbar_classes[key] = this.current_active_item == key ? "hotbar-item hotbar-active" : "hotbar-item";
				if(this.current_active_item == "new_task") {
					this.prepare_new_task();
				}
			}
		},
	},
	methods: {
		clear_date: function() {
			this.new_task.date_begin = {
				date: null,
				time: null
			};
			this.new_task.date_end = {
				date: null,
				time: null
			}
		},
		toggle_even_clearing: function() {
			this.is_even_clearing_enabled = !this.is_even_clearing_enabled;
		},

		chooseAssignee: function(e) {
			this.new_task.assignee = e.currentTarget.getAttribute("user_id");
			this.choosen_assignee = e.currentTarget.textContent.replaceAll(/[\t\n]/g, "");
			this.is_assignee_choosing_modal_active = false;
		},

		startAssigneeChoose: function() {
			this.is_assignee_choosing_modal_active = true;
		},

		select_hotbar_item: function(e) {
			this.current_active_item = e.currentTarget.id;	
		},

		pre_clearFormData: function() {
			this.clear_confirm_class = this.clear_confirm_class == "clear-form-confirm" ? "clear-form-confirm clear-hidden" : "clear-form-confirm";
		},

		clearFormData: function() {
			this.selectStyleObject = {
				background: "",
				boxShadow: "0 0 2px #000000",
			};
			this.current_option_item = null;
			this.new_task.status = null;
			this.new_task.title = null;
			this.new_task.description = null;
			this.new_task.assignee = null;
			this.clear_date();
			this.choosen_assignee = "Выбрать исполнителя";
			this.clear_confirm_class = "clear-form-confirm clear-hidden";
		},

		start_option_selection: function(e) {
			if(this.is_popup_active == false) {
				this.is_popup_active = true;
			} else {
				this.is_popup_active = false;
			}
		},

		select_option_item: function(e) {
			this.selectStyleObject.background = e.currentTarget.getAttribute("name");
			this.selectStyleObject.boxShadow = "none"
			this.new_task.status = e.currentTarget.textContent.replaceAll(/[\t\n]/g, "");
			this.current_option_item = this.new_task.status;
			this.is_popup_active = false;
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
			if(!this.statuses_loaded) {
				this.is_loading = true;
				await createSelection()
						.then(getCurrentUserProfile())
						.then(getAllUsersProfiles())
						.then(this.is_loading = false)
				
			}
		}

	}
});