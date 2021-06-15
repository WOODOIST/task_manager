"use strict";

const MONTHS_STR = [
	"Янв",
	"Фев",
	"Мар",
	"Апр",
	"Май",
	"Июн",
	"Июл",
	"Авг",
	"Сен",
	"Окт",
	"Ноя",
	"Дек"
]

function userListTab (name) {
	return {
		name: name,
		props: {
			user_id: Number,
		},
		data: function() {
			return {
				name: this.$options.name,
				list_of_items_assignee: [],
				list_of_items_author: [],
				current_role_option: 0,
				is_current_form_loading: false,
				is_confirm_modal_active: false,
				task_to_delete_id: null
			}
		},
		mounted() {
			this.load_data();
		},
		methods: {
			select_role_option: function(index) {
				this.current_role_option = index;
			},
			dispatch_user_profile: function(profile) {
				if(profile) {
					let first_n = profile.first_name;
					let second_n = profile.second_name;
					let patronymic = profile.patronymic;
					let result = second_n + " " + first_n + " " + patronymic + " ";
					if(profile.id == this.user_id) {
						result += "(Я)";
					};
					return result;
				}
			},
			load_data: async function() {
				this.list_of_items_author = [];
				this.list_of_items_assignee = [];
				this.is_current_form_loading = true;
				let response_author = await axios.get("api/tasks/?author__profile__id=" + this.user_id);
				let response_assignee = await axios.get("api/tasks/?performer__profile__id=" + this.user_id);
				this.list_of_items_author = response_author.data.results;
				this.list_of_items_assignee = response_assignee.data.results;
				this.is_current_form_loading = false;
			},
			format_date: function(date_string) {
				if(typeof(date_string) == "string" && date_string.trim() != "") {
					let date_arr = date_string.slice(0, 10);
					date_arr = date_arr.split("-");
					// date_arr should be like -> ['YYYY', 'MM', 'DD']
					return date_arr[2] + " " + MONTHS_STR[parseInt(date_arr[1]) - 1] + " " + date_arr[0];					
				} else {
					return "-";
				}
			},
			pre_task_delete: function(task_id) {
				this.is_confirm_modal_active = true;
				this.task_to_delete_id = task_id;
			},
			delete_task: async function() {
				this.is_current_form_loading = true;
				let form_data = new FormData()
				form_data.append("task_id", this.task_to_delete_id);
				try {
					await axios.post("task_delete", form_data, {
						headers: {"X-CSRFToken": getCookie("csrftoken")}
					});
					this.load_data();
				} catch(err) {
					console.error(err);
				}
				this.is_confirm_modal_active = false;
				this.is_current_form_loading = false;
			}
		},
		template: `
			<div class="current-user-list-container">
				<div class="user-role-list-container">
					<div :class="['role-item', {'role-selected':current_role_option==0}]" @click="select_role_option(0)">Автор</div>
					<div :class="['role-item', {'role-selected':current_role_option==1}]" @click="select_role_option(1)">Исполнитель</div>
				</div>
				<div class="user-role-list">
					<div v-cloak v-if="current_role_option==0" class="user-role-data-list role-author-list">
						<div v-for="item in list_of_items_author" class="role-list-item">
							<div class="user-task-info">
								<span class="user-task-id">#{{item.id}}</span>
								<span class="user-task-title">{{item.task_name}}</span>
								<div class="delimiter"></div>
								<div class="author-to-assignee">
									<span class="user-task-author">{{dispatch_user_profile(item.author.profile)}}</span>
									<img src="static/task_manager_static/img/arrow_right.svg" />
									<span class="user-task-author">{{dispatch_user_profile(item.performer.profile)}}</span>
								</div>

								<div class="user-task-time-elapsed">Дата окончания задачи: {{format_date(item.date_end)}}</div>
							</div>
							<div class="user-task-actions">
								<div @click.stop="$emit('open_task_data', item.id)" class="user-task-action" title="Просмотреть задачу">
									<img src="static/task_manager_static/img/task_info.svg" />
								</div>
								<div @click.stop="$emit('open_task_edit', item.id)" class="user-task-action" title="Изменить задачу">
									<img src="static/task_manager_static/img/task_edit.svg" />
								</div>
								<div @click.stop="pre_task_delete(item.id)" class="user-task-action" title="Удалить задачу">
									<img src="static/task_manager_static/img/task_delete.svg" />
								</div>
							</div>
						</div>
					</div>
					<div v-cloak v-if="current_role_option==1" class="user-role-data-list role-performer-list">
						<div v-for="item in list_of_items_assignee" class="role-list-item">
							<div class="user-task-info">
								<span class="user-task-id">#{{item.id}}</span>
								<span class="user-task-title">{{item.task_name}}</span>
								<div class="delimiter"></div>
								<div class="author-to-assignee">
									<span class="user-task-author">{{dispatch_user_profile(item.author.profile)}}</span>
									<img src="static/task_manager_static/img/arrow_right.svg" />
									<span class="user-task-author">{{dispatch_user_profile(item.performer.profile)}}</span>
								</div>

								<div class="user-task-time-elapsed">Дата окончания задачи: {{format_date(item.date_end)}}</div>
							</div>
							<div class="user-task-actions">
								<div @click.stop="$emit('open_task_data', item.id)" class="user-task-action" title="Просмотреть задачу">
									<img src="static/task_manager_static/img/task_info.svg" />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div v-if="is_current_form_loading" class="black-screen">
					<div class="loading-dots-block">
						<div class="dot-bricks"></div>
					</div>
				</div>
				<div v-if="is_confirm_modal_active" class="confirm-deletion">
					<span class="confirm-title">Подтвердить удаление?</span>
					<div class="confirm-buttons">
						<button @click.stop="delete_task" class="confirm-button">Да</button>
						<button @click.stop="is_confirm_modal_active==false" class="confirm-button">Нет</button>
					</div>
				</div>
			</div>
		`
	}
}

function mainListTab (name) {
	return {
		name: name,
		data: function() {
			return {
				name: this.$options.name,
				filters: {
					filter_name: "",
					filter_author: "",
					filter_performer: "",
					filter_created: "",
					filter_date_begin: "",
					filter_date_end: "",
					filter_id: 0,
				},

				list_of_items: []
			}
		},
		computed: {
			active_filter_name: function() {
				return this.filters.filter_name;
			},
			active_filter_author: function() {
				return this.filters.filter_author;
			},
			active_filter_performer: function() {
				return this.filters.filter_performer;
			},
			active_filter_created: function() {
				return this.filters.filter_created;
			},
			active_filter_date_begin: function() {
				return this.filters.filter_date_begin;
			},
			active_filter_date_end: function() {
				return this.filters.filter_date_end;
			},
			active_filter_id: function() {
				return this.filters.filter_id;
			}
			

		},
		mounted() {
			this.get_filtered_data_by();
		},
		methods: {
			create_filter_query: function() {
				this.get_filtered_data_by({
						"filter_name": "task_name__contains=" + this.active_filter_name,
						"filter_author": "author__profile__second_name__contains=" + this.active_filter_author,
						"filter_performer": "performer__profile__second_name__contains=" + this.active_filter_performer,
						"filter_created": "date_of_creation__date__range=" + this.active_filter_created + "," + this.active_filter_created,
						"filter_date_begin": "date_begin__date__range=" + this.active_filter_date_begin + "," + this.active_filter_date_begin,
						"filter_date_end": "date_end__date__range=" + this.active_filter_date_end + "," + this.active_filter_date_end,
						"filter_id": "id=" + this.active_filter_id
				})
			},
			get_filtered_data_by: async function(filter_strings_object) {
				let final_query = "?";
				if(filter_strings_object) {
					for(const [key, value] of Object.entries(filter_strings_object)) {
						let cur_element = this.filters[key];
						if(cur_element != undefined && cur_element != "") {
							final_query += value + "&";
						}
					}
				}
				
				const response = await axios.get("api/tasks/"+ final_query); 
				this.list_of_items = [];
				if(response.data.results.length > 0) {
					this.list_of_items = response.data.results;	
				}

			},
			format_date: function(dateString) {
				if(typeof(dateString) == "string" && dateString.trim() != "") {
					return dateString.slice(0, 10);
				} else {
					return "-";
				}
			}
		},
		template: `
			<div class="tasks-list-container">
				<div class="tasks-filter-header">
					<button @click="create_filter_query" class="tasks-filter-action">FILTER</button>
					<div :class="['task-filter-item-container', {'active': active_filter_name}]">
						<img src="static/task_manager_static/img/filter_icon.svg">
						<div class="filter-input">
							<input type="text" v-model="filters.filter_name" placeholder="Название задачи">
							<img src="static/task_manager_static/img/filter_search_icon.svg">
						</div>
					</div>

					<div :class="['task-filter-item-container', {'active': active_filter_author}]">
						<img src="static/task_manager_static/img/filter_icon.svg">
						<div class="filter-input">
							<input type="text" v-model="filters.filter_author" placeholder="Фамилия">
							<img src="static/task_manager_static/img/filter_search_icon.svg">
						</div>
					</div>

					<div :class="['task-filter-item-container', {'active': active_filter_performer}]">
						<img src="static/task_manager_static/img/filter_icon.svg">
						<div class="filter-input">
							<input type="text" v-model="filters.filter_performer" placeholder="Фамилия">
							<img src="static/task_manager_static/img/filter_search_icon.svg">
						</div>
					</div>

					<div :class="['task-filter-item-container', {'active': active_filter_created}]">
						<img src="static/task_manager_static/img/filter_icon.svg">
						<div class="filter-input">
							<input type="date" v-model="filters.filter_created">
							<img src="static/task_manager_static/img/filter_search_icon.svg">
						</div>
					</div>

					<div :class="['task-filter-item-container', {'active': active_filter_date_begin}]">
						<img src="static/task_manager_static/img/filter_icon.svg">
						<div class="filter-input">
							<input type="date" v-model="filters.filter_date_begin">
							<img src="static/task_manager_static/img/filter_search_icon.svg">
						</div>
					</div>

					<div :class="['task-filter-item-container', {'active': active_filter_date_end}]">
						<img src="static/task_manager_static/img/filter_icon.svg">
						<div class="filter-input">
							<input type="date" v-model="filters.filter_date_end">
							<img src="static/task_manager_static/img/filter_search_icon.svg">
						</div>
					</div>

					<div :class="['task-filter-item-container', {'active': active_filter_id}]">
						<img src="static/task_manager_static/img/filter_icon.svg">
						<div class="filter-input">
							<input type="number" v-model="filters.filter_id" placeholder="Номер задачи">
							<img src="static/task_manager_static/img/filter_search_icon.svg">
						</div>
					</div>
				</div>
				<div class="tasks-list-table">
					<div class="tasks-list-table-headers">
						<span>Название задачи</span>
						<span>Автор</span>
						<span>Исполнитель</span>
						<span>Создано</span>
						<span>Начало в</span>
						<span>Завершить до</span>
						<span>Номер</span>
					</div>
					<div class="tasks-list-data">
						<div v-for="item in list_of_items" class="task-list-entry">
							<span class="task-list-item">{{item.task_name}}</span>
							<span class="task-list-item">{{item.author.profile.second_name}} {{item.author.profile.first_name}} {{item.author.profile.patronymic}}</span>
							<span class="task-list-item">{{item.performer.profile.second_name}} {{item.performer.profile.first_name}} {{item.performer.profile.patronymic}}</span>
							<span class="task-list-item">{{format_date(item.date_of_creation)}}</span>
							<span class="task-list-item">{{format_date(item.date_begin)}}</span>
							<span class="task-list-item">{{format_date(item.date_end)}}</span>
							<span @click.self="$emit('open_task_data', item.id)" class="task-list-item task-list-item-link">#{{item.id}}</span>
						</div>
					</div>
				</div>
			</div>
		`
	}
}

function createTaskTab (name, open_task_id) {
		return {
		name: name,
		open_task_id: open_task_id,
		props: {
			user_profile: String,
			user_profiles: Array,
			selection_items: Array,
			current_active_item: Number,
			user_id: Number,
			read_only_enabled: Boolean
		},
		data: function() {
			return {
				name: this.$options.name,
				open_task_id: this.$options.open_task_id,
				choosen_assignee: "Выбрать исполнителя",

				is_current_form_loading: false, 

				server_response_text: "",
				show_response_text: false,
				response_status: "",

				task_id_display: "Новая задача",

				is_assignee_choosing_modal_active: false,
				is_field_deleting_enabled: false,
				is_popup_active: false,
				current_status_option_item: "",

				selected_style_object: {
					background: "",
				},

				clear_confirm_class: "clear-form-confirm clear-hidden",
				task_author_id: -1,
				is_form_read_only: this.read_only_enabled,
				task_form_data: {
					id: "",
					status: "",
					title: "",
					description: "",
					author: this.user_profile,
					assignee: -1,
					date_begin: {
						date: "",
						time: "",
					},
					date_end: {
						date: "",
						time: "",
					},
					uploaded_files: [

					],
					commentary: false
				},

			}

		},
		mounted() {
			if(this.open_task_id) {
				this.get_task_data(open_task_id);
			}
		},

		computed: {
			date_begin_empty: function() {
				return (this.task_form_data.date_begin.date.trim() == "" || this.task_form_data.date_begin.time).trim() == "";
			},
			date_end_empty: function() {
				return this.task_form_data.date_end.date.trim() == "" || this.task_form_data.date_end.time.trim() == "";
			},
			task_title_class: function() {
				return this.task_form_data.title.trim() == "" ? "task-title task-empty" : "task-title";
			},
			task_end_date_class: function() {
				return this.date_end_empty ? "task-assignation-box dates-choosing task-empty" : "task-assignation-box dates-choosing";
			},
			task_assignee_class: function() {
				return this.task_form_data.assignee < 0 ? "task-assignation-box assignee-choosing task-empty" : "task-assignation-box assignee-choosing";
			},
			form_status_field_class: function() {
				if(this.task_form_data.status.trim() == "") {
					return "task-option-field task-empty";
				} else if(this.is_form_read_only) {
					return "task-option-field read-only";
				} 
				return "";
			},
			is_submit_is_enabled: function() {
				if(!this.task_form_data.title.trim() || this.date_end_empty || this.task_form_data.assignee < 0
				   || !this.task_form_data.status) {
					return false;
				} return true;
			}
		},

		template: `<form enctype="multipart/form-data" v-cloak action="post" class="new-task-creation-form">
				<div class="task-header">
					<span class="task-identifier">#{{task_form_data.id ? task_form_data.id : "Новая задача"}}</span>
					<div :style="selected_style_object" @click.self="start_option_selection" :class="form_status_field_class" id="statusSelection">{{current_status_option_item}}
						<div v-if="is_popup_active" class="status-option-containment">
							<span @click.self="select_option_item(option_item.color, option_item.name)" class="option-item" v-for="option_item in selection_items">
								{{option_item.name}}
							</span>
						</div>
					</div>
				</div>
				<div :class="task_title_class">
					<input :disabled="is_form_read_only" type="text" class="task-title-input" placeholder="Название задачи" v-model="task_form_data.title">
					<div @click="task_form_data.title=''" v-if="is_field_deleting_enabled" class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
						<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
					</div>
				</div>
				<span class="task-description-title title-section-text">Описание</span>
				<div class="task-description">
					<textarea :disabled="is_form_read_only" class="task-description-area" cols="50" rows="10" v-model="task_form_data.description"></textarea>
					<div @click="task_form_data.description=''" v-if="is_field_deleting_enabled" class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
						<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
					</div>
				</div>
				<img v-if="!is_form_read_only" src="static/task_manager_static/img/even_clear_enabled.svg" class="clear-even-button" @click="is_field_deleting_enabled = !is_field_deleting_enabled" alt="">
				<div v-if="!is_form_read_only" class="clear-form-container" @click.self="pre_clear_form">
					Очистить поля формы
					<div @click.self="clear_form" :class="clear_confirm_class">
						Подтвердить?
					</div>
				</div>
				<div class="horizontal-row-flex horz_row1">
					<div class="vertical-row-flex vert_row1">
						<span class="task-active-assignation title-section-text">Текущие лица</span>
						<div class="task-active-assignation-container">
							<div class="task-assignation-box">
								<span class="assignee-side">Автор</span>
								<span class="assignee-name">{{task_form_data.author}}</span>
							</div>
							<img class="task-assign-to-arrow" src="static/task_manager_static/img/arrow_right.svg" alt="">
							<div :disabled="is_form_read_only" :class="task_assignee_class">
								<span class="assignee-side">Исполнитель</span>
								<span class="assignee-name" @click="start_assignee_choose">{{choosen_assignee}}</span>
							</div>
						</div>		
					</div>
					<div class="vertical-row-flex vert_row2">
						<span class="task-active-assignation title-section-text">Выбор дат</span>
						<div :class="task_end_date_class">
							<div class="date-input-item">
								<label for="dateStartInp">Начать c:</label>
								<input :disabled="is_form_read_only" type="date" :max="task_form_data.date_end.date" v-model="task_form_data.date_begin.date" id="dateStartInp">
								<input :disabled="is_form_read_only" type="time" v-model="task_form_data.date_begin.time" id="dateStartInp">
							</div>
							<div class="date-input-item">
								<label for="dateEndInp">Закончить в:</label>
								<input :disabled="is_form_read_only" type="date" :min="task_form_data.date_begin.date" v-model="task_form_data.date_end.date" id="dateEndInp">
								<input :disabled="is_form_read_only" type="time" v-model="task_form_data.date_end.time" id="dateEndInp">
							</div>
							<div @click="clear_date" v-if="is_field_deleting_enabled" class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
								<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
							</div>
						</div>
					</div>
				</div>
				<div class="horizontal-row-flex horz_row2">
					<div class="vertical-row-flex vert_row1">
						<span class="task-active-assignation title-section-text">Вложения</span>
						<div class="files-input-container">
							<div @click="task_form_data.uploaded_files = []" v-if="is_field_deleting_enabled" class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
								<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
							</div>
							<div class="files-input">
								<label :disabled="is_form_read_only" for="fileInput">Файлы</label>
								<input :disabled="is_form_read_only" type="file" v-on:change="upload_files" name="" multiple id="fileInput">
							</div>
							<div class="files-list-container">
								<div class="file-item" v-for="file_item in task_form_data.uploaded_files" >
									<img class="item-file-thumb" :src="get_file_item_thumbnail(file_item.filename)" alt="">
									<div class="under-object-text file-item-object-name">{{file_item.filename}}</div>
									<div class="file-actions">
										<div v-if="!is_form_read_only" @click.self="remove_file_from_list(file_item)"  class="item-deletion">-</div>
										<a v-if="task_form_data.id && is_form_read_only" class="item-download" :href="file_item.file" :download="file_item.filename">
											<img src="static/task_manager_static/img/download_button.svg" />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="submition-container">
					<button v-if="is_submit_is_enabled && !is_form_read_only" type="submit" @click="try_to_submit" class="new-task-creation-submit">Сохранить</button> 
				</div>

				<!-- utilities -->
				<div v-cloak v-if="is_assignee_choosing_modal_active" class="black-screen">
					<div class="assignee-selection-modal">
						<span class="assignee-selection-modal-title">Список достпуных исполнителей</span>
						<div class="assignee-list">
							<div @click="choose_assignee(profile)" class="assignee-list-item" v-for="profile in user_profiles">
								{{profile.second_name}} {{profile.first_name}} {{profile.patronymic}}
							</div>
						</div>
						<div class="exit-assignee" @click="is_assignee_choosing_modal_active=false">
							<span class="ex_1"></span>
							<span class="ex_2"></span>
						</div>
					</div>
					
				</div>
				
				<div v-if="show_response_text" class="server-messages-box" @click="clear_message_box(true)">
					<img :src="[response_status<=300 ? 'static/task_manager_static/img/good_response.svg' : 'static/task_manager_static/img/bad_response.svg']" alt="">
					<span>{{server_response_text}}</span>
				</div>

				<div v-if="is_current_form_loading" class="form-black-screen">
					<div class="loading-dots-block">
						<div class="dot-bricks"></div>
					</div>
				</div>
			</form>
			`,
		methods: {
			/* Обработка файлов */
			upload_files: function(e) {
				if(!this.is_form_read_only) {
					let files = e.target.files;
					let files_quantity = files.length;

					// outer_f - итератор для внешних файлов (из input)
					// inner_f - итератор для файлов объекта 
					for(let outer_f = 0; outer_f < files_quantity; outer_f++) {
						if(this.task_form_data.uploaded_files.filter(function(item) {
							return item.filename == files[outer_f].name ? item : null;
						}).length == 0) {
							this.task_form_data.uploaded_files.push({
								filename: files[outer_f].name,
								file: files[outer_f],
								index: outer_f
							})
						}
					}

					e.target.value = "";
				}
			},
			remove_file_from_list: function(item) {
				if(!this.is_form_read_only) {
					let delete_index = this.task_form_data.uploaded_files.indexOf(item);
					this.task_form_data.uploaded_files.splice(delete_index, 1);
				}
			},

			clear_date: function() {
				if(!this.is_form_read_only) {
					this.task_form_data.date_begin = {
						date: "",
						time: ""
					};
					this.task_form_data.date_end = {
						date: "",
						time: ""
					}
				}
			},
			start_assignee_choose: function() {
				if(!this.is_form_read_only) {
					this.is_assignee_choosing_modal_active = true;
				}
			},
			start_option_selection: function() {
				if(!this.is_form_read_only) {
					if(this.is_popup_active == false) {
						this.is_popup_active = true;
					} else {
						this.is_popup_active = false;
					}
				}
			},
			select_option_item: function(bg_color, status_name) {
				if(!this.is_form_read_only) {
					this.selected_style_object.background = bg_color;
					this.selected_style_object.boxShadow = "none";
					this.task_form_data.status = status_name.replaceAll(/[\t\n]/g, "");
					this.current_status_option_item = this.task_form_data.status;
					this.is_popup_active = false;
				}
			},
			pre_clear_form: function() {
				if(!this.is_form_read_only) {
					this.clear_confirm_class = this.clear_confirm_class == "clear-form-confirm" ? "clear-form-confirm clear-hidden" : "clear-form-confirm";
				}
			},
			clear_form: function() {
				if(!this.is_form_read_only) {
					this.selected_style_object = {
						background: "",
						boxShadow: "0 0 2px #000000",
					};
					this.current_status_option_item = "";
					this.task_form_data.status = "";
					this.task_form_data.title = "";
					this.task_form_data.description = "";
					this.task_form_data.assignee = -1;
					this.clear_date();
					this.task_form_data.uploaded_files = [];
					this.choosen_assignee = "Выбрать исполнителя";
					this.clear_confirm_class = "clear-form-confirm clear-hidden";
					this.task_form_data.commentary = false;
				}
			},
			get_file_item_thumbnail: function(item) {
				let item_extension = getFileExtension(item);
				if(item_extension) {
					item_extension = item_extension.toLowerCase();
					if("jpeg gif png svg jpg bmp tif tiff".includes(item_extension)) {
						return fileThumbnailsSrc["img"];
					} else if("tar-gz tgz xar zip rar cab cbr jar pak gzu gzip deb 7z".includes(item_extension)) {
						return fileThumbnailsSrc["archive"];
					} else if("java py bas pas c rtf html htm rtf doc docx xls xlsx txt".includes(item_extension)) {
						return fileThumbnailsSrc["text"];
					}
				}
					
				return fileThumbnailsSrc["undefinedFile"];

			},
			choose_assignee: function(prof_data) {
				if(!this.is_form_read_only) {
					this.task_form_data.assignee = prof_data.id;
					this.choosen_assignee = prof_data.second_name + " " + prof_data.first_name + " " +prof_data.patronymic;
					this.is_assignee_choosing_modal_active = false;
				}
			},
			clear_message_box: function(is_forced) {
				if(!this.is_form_read_only) {
					let current_component = this;
					if(is_forced) {
						current_component.server_response_text = "";
						current_component.response_status = null;
						current_component.show_response_text = false;
					} else {
						setTimeout(function() {
							if(current_component.show_response_text == true) {
								current_component.server_response_text = "";
								current_component.response_status = null;
								current_component.show_response_text = false;
							}
						}, 5000);
					}
				}
			},
			show_message_box: function(text, status) {
				if(!this.is_form_read_only) {
					this.server_response_text = text;
					this.response_status = status;
					this.show_response_text = true;
				}
			},
			try_to_submit: function(e) {
				if(!this.is_form_read_only) {
					e.preventDefault();
					let formData = new FormData();
					let server_loaded = [];
					for(let i = 0; i < this.task_form_data.uploaded_files.length; i++) {
						let file_data = this.task_form_data.uploaded_files[i];
						let file = file_data["file"] ? file_data["file"] : null;
						let filename = file_data.filename;
						if(file) {
							formData.append(filename, file);
						} else {
							server_loaded.push(filename);
						}
					}
					formData.append('task', JSON.stringify(this.task_form_data));
					formData.append('server_loaded_files', server_loaded.toString());
					let current_component = this;
					axios.post("task_form_data_post", formData, {
						headers: {
							"X-CSRFToken": getCookie("csrftoken"),
							"Content-Type": "charset=utf-8"
						}
					}).then(function (response) {
						if(response.status == 200) {
							if(response.data.task_created_id) {
								current_component.task_id_display = response.data.task_created_id;
								current_component.task_form_data.id = response.data.task_created_id;
							}
						}
						current_component.show_message_box(response.data.message, response.status);
					}).catch(function (err) {
						current_component.show_message_box(err.response.data.message, err.response.status);
					}).finally(function() {
						current_component.clear_message_box();
					})
				}
			},

			get_task_data: async function(id) {
				this.clear_message_box(true);
				let task_is_loaded = false;
				let files_is_loaded = false;
				this.is_current_form_loading = true;
				if(!task_is_loaded) {
					let response = await axios.get("api/tasks/?id=" + id);
					if(response.status == 200 && response.data.results.length == 1) {
						// Заполнение локальных данных задачи для компонента
						const data = response.data.results[0];
						this.task_form_data.id = data.id;
						this.task_form_data.title = data.task_name;
						this.task_form_data.description = data.description ? data.description : "";
						this.task_form_data.commentary = data.commentary;
						this.task_form_data.status = data.status?.name || "";
						this.task_form_data.assignee = data.performer.id;
						this.task_form_data.author = data.author.profile.second_name + " " +
											 		 data.author.profile.first_name + " " +
											  		 data.author.profile.patronymic;
						this.choosen_assignee = data.performer.profile.second_name + " " + 
												data.performer.profile.first_name + " " +
												data.performer.profile.patronymic;

						this.task_form_data.date_begin = {
							// Дата возвращается в полном формате - (0001-01-01T00:00:00.000000Z)
							date: data.date_begin.slice(0,10), 
							time: data.date_begin.slice(11, 16)
						}
						this.task_form_data.date_end = {
							// Дата возвращается в полном формате - (0001-01-01T00:00:00.000000Z)
							date: data.date_end.slice(0,10), 
							time: data.date_end.slice(11, 16)
						};
							
						// Загрузка названий файлов (при повторном сохранении файлы на сервере не изменятся)
						if(!files_is_loaded) {
							let files_response = await axios.get("api/files/?task=" + data.id);
							if(files_response.status == 200 && files_response.data.results.length > 0) {
								for(let i = 0; i < files_response.data.results.length; i++) {
									this.task_form_data.uploaded_files.push({
										filename: files_response.data.results[i].filename,
										index: i,
										file: files_response.data.results[i].file
									})
								}
							}
							files_is_loaded = true;
						}

						// Указание локальных данных для компонента 
						this.current_status_option_item = data.status.name;
						this.task_author_id = data.author.profile.id;
						this.choose_assignee(data.performer.profile);
						this.selected_style_object = {
							background: data.status.color,
							boxShadow: "none",
						};
						this.task_is_loaded = true;
						}
				}
				this.clear_message_box();
				this.is_current_form_loading = false;
			}
		}
	};
}