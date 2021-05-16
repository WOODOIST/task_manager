"use strict";

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
		watch: {
			filters: {
				handler: function(val) {
					this.get_filtered_data_by({
						"filter_name": "task_name=" + this.active_filter_name,
						"filter_author": "author__profile__second_name=" + this.active_filter_author,
						"filter_performer": "performer__profile__second_name=" + this.active_filter_performer,
						"filter_created": "date_of_creation__date__range=" + this.active_filter_created + "," + this.active_filter_created,
						"filter_date_begin": "date_begin__date__range=" + this.active_filter_date_begin + "," + this.active_filter_date_begin,
						"filter_date_end": "date_end__date__range=" + this.active_filter_date_end + "," + this.active_filter_date_end,
						"filter_id": "id=" + this.active_filter_id
					})
				},
				deep: true
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
			get_filtered_data_by: function(filter_strings_object) {
				let final_query = "?";
				if(filter_strings_object) {
					for(const [key, value] of Object.entries(filter_strings_object)) {
						let cur_element = this.filters[key];
						if(cur_element != undefined && cur_element != "") {
							final_query += value + "&";
						}
					}
				}
				const current_component = this;
				axios.get("api/tasks/"+ final_query).then(function(response) {
					current_component.list_of_items = [];
					if(response.data.results.length > 0) {
						current_component.list_of_items = response.data.results;	
					}
					console.log(current_component.list_of_items.length)
				});
			},
			format_date: function(dateString) {
				if(typeof(dateString) == "string") {
					return dateString.slice(0, 10);
				} else {
					return "-"
				}
			}
		},
		template: `
			<div class="tasks-list-container">
				<div class="tasks-filter-header">
					
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

				task_form_data: {
					id: "",
					status: "",
					title: "",
					description: "",
					author: "",
					assignee: "",
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
			date_begin: function() {
				return (this.task_form_data.date_begin.date + " " + this.task_form_data.date_begin.time).trim();
			},
			date_end: function() {
				return (this.task_form_data.date_end.date + " " + this.task_form_data.date_end.time).trim();
			},
			task_title_class: function() {
				return this.task_form_data.title.trim() == "" ? "task-title task-empty" : "task-title";
			},
			task_end_date_class: function() {
				return this.date_end == "" ? "task-assignation-box dates-choosing task-empty" : "task-assignation-box dates-choosing";
			},
			task_assignee_class: function() {
				return this.task_form_data.assignee < 0 ? "task-assignation-box assignee-choosing task-empty" : "task-assignation-box assignee-choosing";
			},
			is_submit_is_enabled: function() {
				if(!this.task_form_data.title.trim() || !this.date_end || this.task_form_data.assignee < 0) {
						return false;
				} return true;
			}
		},

		template: `<form enctype="multipart/form-data" v-cloak action="post" class="new-task-creation-form">
				<div class="task-header">
					<span class="task-identifier">#{{task_form_data.id ? task_form_data.id : "Новая задача"}}</span>
					<div :style="selected_style_object" @click.self="start_option_selection" id="statusSelection">{{current_status_option_item}}
						<div v-if="is_popup_active" class="status-option-containment">
							<span @click.self="select_option_item(option_item.color, option_item.name)" class="option-item" v-for="option_item in selection_items">
								{{option_item.name}}
							</span>
						</div>
					</div>
				</div>
				<div :class="task_title_class">
					<input type="text" class="task-title-input" placeholder="Название задачи" v-model="task_form_data.title">
					<div @click="task_form_data.title=''" v-if="is_field_deleting_enabled" class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
						<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
					</div>
				</div>
				<span class="task-description-title title-section-text">Описание</span>
				<div class="task-description">
					<textarea class="task-description-area" cols="50" rows="10" v-model="task_form_data.description"></textarea>
					<div @click="task_form_data.description=''" v-if="is_field_deleting_enabled" class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
						<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
					</div>
				</div>
				<img src="static/task_manager_static/img/even_clear_enabled.svg" class="clear-even-button" @click="is_field_deleting_enabled = !is_field_deleting_enabled" alt="">
				<div class="clear-form-container" @click.self="pre_clear_form">
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
								<span class="assignee-name">{{user_profile}}</span>
							</div>
							<img class="task-assign-to-arrow" src="static/task_manager_static/img/arrow_right.svg" alt="">
							<div :class="task_assignee_class">
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
								<input type="date" :max="task_form_data.date_begin.date" v-model="task_form_data.date_begin.date" id="dateStartInp">
								<input type="time" v-model="task_form_data.date_begin.time" id="dateStartInp">
							</div>
							<div class="date-input-item">
								<label for="dateEndInp">Закончить в:</label>
								<input type="date" :min="task_form_data.date_begin.date" v-model="task_form_data.date_end.date" id="dateEndInp">
								<input type="time" v-model="task_form_data.date_end.time" id="dateEndInp">
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
								<label for="fileInput">Файлы</label>
								<input type="file" v-on:change="upload_files" name="" multiple id="fileInput">
							</div>
							<div class="files-list-container">
								<div class="file-item" v-for="file_item in task_form_data.uploaded_files" >
									<img :src="get_file_item_thumbnail(file_item.filename)" alt="">
									<div class="under-object-text file-item-object-name">{{file_item.filename}}</div>
									<div @click.self="remove_file_from_list(file_item)"  class="item-deletion">-</div>
								</div>
							</div>
						</div>
					</div>
					<div class="vertical-row-flex vert_row2">
						<div class="horizontal-row-flex comment-toggle-box">
							<span class="task-active-assignation title-section-text">Комментарии</span>
							<div v-cloak class="toggle-switcher-box" @click="task_form_data.commentary = !task_form_data.commentary" :is_commentary_enabled="task_form_data.commentary">
								<div class="switcher-element">
									<div class="switcher-line"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="submition-container">
					<button v-if="is_submit_is_enabled" type="submit" @click="try_to_submit" class="new-task-creation-submit">Сохранить</button> 
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
			},
			remove_file_from_list: function(item) {
				let delete_index = this.task_form_data.uploaded_files.indexOf(item);
				this.task_form_data.uploaded_files.splice(delete_index, 1);
			},

			clear_date: function() {
				this.task_form_data.date_begin = {
					date: "",
					time: ""
				};
				this.task_form_data.date_end = {
					date: "",
					time: ""
				}
			},
			start_assignee_choose: function() {
				this.is_assignee_choosing_modal_active = true;
			},
			start_option_selection: function() {
				if(this.is_popup_active == false) {
					this.is_popup_active = true;
				} else {
					this.is_popup_active = false;
				}
			},
			select_option_item: function(bg_color, status_name) {
				this.selected_style_object.background = bg_color;
				this.selected_style_object.boxShadow = "none";
				this.task_form_data.status = status_name.replaceAll(/[\t\n]/g, "");
				this.current_status_option_item = this.task_form_data.status;
				this.is_popup_active = false;
			},
			pre_clear_form: function() {
				this.clear_confirm_class = this.clear_confirm_class == "clear-form-confirm" ? "clear-form-confirm clear-hidden" : "clear-form-confirm";
			},
			clear_form: function() {
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
				this.task_form_data.assignee = prof_data.id;
				this.choosen_assignee = prof_data.second_name + " " + prof_data.first_name + " " +prof_data.patronymic;
				this.is_assignee_choosing_modal_active = false;
			},
			clear_message_box: function(is_forced) {
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
			},
			show_message_box: function(text, status) {
				this.server_response_text = text;
				this.response_status = status;
				this.show_response_text = true;
			},
			try_to_submit: function(e) {
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
				console.log(this.task_form_data.uploaded_files)
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
			},

			get_task_data: function(id) {
				const current_component = this;
				const current_task = current_component.task_form_data;
				this.clear_message_box(true);
				let task_is_loaded = false;
				let files_is_loaded = false;
				this.is_current_form_loading = true;
				if(!task_is_loaded) {
					axios.get("api/tasks/?id=" + id).then(function(response) {
						if(response.status == 200 && response.data.results.length == 1) {
							// Заполнение локальных данных задачи для компонента
							const data = response.data.results[0];
							current_task.id = data.id;
							current_task.title = data.task_name;
							current_task.description = data.description ? data.description : "";
							current_task.commentary = data.commentary;
							current_task.status = data.status.name;
							current_task.date_begin = {
								// Дата возвращается в полном формате - (0001-01-01T00:00:00.000000Z)
								date: data.date_begin.slice(0,10), 
								time: data.date_begin.slice(11, 16)
							}
							current_task.date_end = {
								// Дата возвращается в полном формате - (0001-01-01T00:00:00.000000Z)
								date: data.date_end.slice(0,10), 
								time: data.date_end.slice(11, 16)
							};
							
							// Загрузка названий файлов (при повторном сохранении файлы на сервере не изменятся)
							if(!files_is_loaded) {
								axios.get("api/files/?task=" + data.id).then(function(response) {
									if(response.status == 200 && response.data.results.length > 0) {
										for(let i = 0; i < response.data.results.length; i++) {
											current_task.uploaded_files.push({
												filename: response.data.results[i].filename,
												index: i
											})
										}
									}
									files_is_loaded = true;
								})
							}

							// Указание локальных данных для компонента 
							current_component.current_status_option_item = data.status.name;
							current_component.choose_assignee(data.performer.profile);
							current_component.selected_style_object = {
								background: data.status.color,
								boxShadow: "none",
							};
							task_is_loaded = true;
						}
					}).catch(function(err) {
						console.error(err);
					}).finally(function() {
						current_component.clear_message_box();
						current_component.is_current_form_loading = false;
					})
				}
			}

		}
	};
}