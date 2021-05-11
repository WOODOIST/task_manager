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
		user_profile: null,
		user_profiles: [],

		is_loading: false,
		show_logout: false,
		statuses_loaded: false,

		active_component: null,
		current_active_item: null,

		current_active_tab: {
			tab_name: "",
			tab_component: null
		},

		selection_items: [],

		hotbar_items: [
			{
				name: "Список задач",
				action_name: "task_pool"
			},
			{
				name: "Создать задачу",
				action_name: "task_create"
			}
		],

		tabs: []
	},
	mounted() {
		this.prepare_new_task();
	},
	computed: {
		custom_font_size: function() {
			let font_size = 18 - this.hotbar_items.length * 0.5;
			return (font_size <= 1 ? 3 : font_size) + "px";
		}
	},
	watch: {
		current_active_item: function() {
			this.is_loading = true;
			if(this.current_active_item.action_name == "task_create") {
				this.hotbar_items.push(
					{
						name: "Новая задача",
						tab_id: this.hotbar_items.length - 1
					}
				);
				this.current_active_item = this.hotbar_items[this.hotbar_items.length - 1];
			} else if(this.current_active_item.tab_id) {
				let tab_exists = 0;
				for(let i = 0; i < this.tabs.length; i++) {
					if(this.tabs[i].tab_name == "tab_" + this.current_active_item.tab_id) {
						tab_exists = 1;
						break;
					}
				};

				if(!tab_exists) {
					let new_component = new createTaskTab("tab_" + this.current_active_item.tab_id);
					let tab_info = {
						tab_name: new_component.name,
						tab_component: Vue.component(new_component.name, new_component)
					};

					this.tabs.push(tab_info);
					this.current_active_tab = tab_info;
				} else {
					this.current_active_tab = mainTaskApp.tabs.filter(item => item.tab_name=="tab_" + mainTaskApp.current_active_item.tab_id)[0];
				}
				this.active_component = {
					is: this.current_active_tab.tab_name,
					user_profiles: this.user_profiles,
					user_profile: this.user_profile,
					selection_items: this.selection_items,
					current_active_item: this.current_active_item	
				}
			}
			this.is_loading = false;
		}
	},
	methods: {
		remove_file_from_list: function(indexOfItem) {
			let deletingItemIndex = -1;
			
			for(let i = 0; i < this.new_task.uploaded_files.length; i++) {
				if(this.new_task.uploaded_files[i].index == indexOfItem) {
					deletingItemIndex = i;
					break;
				}
			}
			if(deletingItemIndex > -1) {
				this.new_task.uploaded_files.splice(deletingItemIndex, 1);
			}

		},

		upload_files: function(e) {
			for(let outer = 0; outer < e.target.files.length; outer++) {
				let has_item = 0;
				for(let inner = 0; inner < this.new_task.uploaded_files; inner++) {
					if(e.target.files[outer] == this.new_task.uploaded_files[outer]) {
						has_item = 1;
						break;
					}
				}
				if(!has_item) this.new_task.uploaded_files.push(
					{
						file: e.target.files[outer],
						index: outer,
					}	
				);
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

