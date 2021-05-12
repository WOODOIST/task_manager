"use strict";

function createTaskTab (name) {
		return {
		name: name,
		props: {
			user_profile: String,
			user_profiles: Array,
			selection_items: Array,
			current_active_item: Number,
		},
		data: function() {
			return {
				name: this.$options.name,
				choosen_assignee: "Выбрать исполнителя",

				server_response_text: "",
				show_response_text: false,
				response_status: null,

				form_fields_validated: [
					0, 0, 0
				],

				task_id_display: "Новая задача",
				active_subcomponent: null,

				is_submit_is_enabled: false,
				is_assignee_choosing_modal_active: false,
				is_field_deleting_enabled: false,
				is_popup_active: false,
				current_status_option_item: "",

				selected_style_object: {
					background: "",
				},

				clear_confirm_class: "clear-form-confirm clear-hidden",
				task_title_class: "task-title task-empty",
				task_end_date_class: "date-input-item task-empty",
				task_assignee_class: "task-assignation-box assignee-choosing task-empty",
				
				new_task: {
					id: null,
					status: null,
					title: "",
					description: "",
					author: null,
					assignee: null,
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
				}

			}
		},
		template: `<form enctype="multipart/form-data" v-cloak action="post" class="new-task-creation-form">
				<div class="task-header">
					<span class="task-identifier">#{{new_task.id ? new_task.id : "Новая задача"}}</span>
					<div :style=selected_style_object @click.self=start_option_selection id="statusSelection">{{current_status_option_item}}
						<div v-if=is_popup_active class="status-option-containment">
							<span @click.self=select_option_item class="option-item" v-for="option_item in selection_items" :name=option_item.color>
								{{option_item.name}}
							</span>
						</div>
					</div>
				</div>
				<div :class=task_title_class>
					<input type="text" class="task-title-input" placeholder="Название задачи" v-model=new_task.title>
					<div @click="new_task.title=''" v-if=is_field_deleting_enabled class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
						<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
					</div>
				</div>
				<span class="task-description-title title-section-text">Описание</span>
				<div class="task-description">
					<textarea class="task-description-area" name="" id="" cols="30" rows="10" v-model=new_task.description></textarea>
					<div @click="new_task.description=''" v-if=is_field_deleting_enabled class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
						<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
					</div>
				</div>
				<img src="static/task_manager_static/img/even_clear_enabled.svg" class="clear-even-button" @click="is_field_deleting_enabled = !is_field_deleting_enabled" alt="">
				<div class="clear-form-container" @click.self=pre_clear_form>
					Очистить поля формы
					<div @click.self=clear_form :class=clear_confirm_class>
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
							<div :class=task_assignee_class>
								<span class="assignee-side">Исполнитель</span>
								<span class="assignee-name" @click=start_assignee_choose>{{choosen_assignee}}</span>
							</div>
						</div>		
					</div>
					<div class="vertical-row-flex vert_row2">
						<span class="task-active-assignation title-section-text">Выбор дат</span>
						<div class="task-assignation-box dates-choosing">
							<div class="date-input-item">
								<label for="dateStartInp">Начать c:</label>
								<input type="date" :max=new_task.date_begin.date v-model=new_task.date_begin.date id="dateStartInp">
								<input type="time" v-model=new_task.date_begin.time id="dateStartInp">
							</div>
							<div :class=task_end_date_class>
								<label for="dateEndInp">Закончить в:</label>
								<input type="date" :min=new_task.date_begin.date v-model=new_task.date_end.date id="dateEndInp">
								<input type="time" v-model=new_task.date_end.time id="dateEndInp">
							</div>
							<div @click=clear_date v-if=is_field_deleting_enabled class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
								<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
							</div>
						</div>
					</div>
				</div>
				<div class="horizontal-row-flex horz_row2">
					<div class="vertical-row-flex vert_row1">
						<span class="task-active-assignation title-section-text">Вложения</span>
						<div class="files-input-container">
							<div @click="new_task.uploaded_files = []" v-if=is_field_deleting_enabled class="clear-current-field clear-title-field" title="Очистить поле без подтверждения">
								<img src="static/task_manager_static/img/clear_field_icon.svg" alt="">
							</div>
							<div class="files-input">
								<label for="fileInput">Файлы</label>
								<input type="file" v-on:change=upload_files name="" multiple id="fileInput">
							</div>
							<div class="files-list-container">
								<div class="file-item"  v-for="file_item in new_task.uploaded_files" >
									<img :src=get_file_item_thumbnail(file_item.file.name) alt="">
									<div class="under-object-text file-item-object-name">{{file_item.file.name}}</div>
									<div @click.self=remove_file_from_list(file_item.index)  class="item-deletion">-</div>
								</div>
							</div>
						</div>
					</div>
					<div class="vertical-row-flex vert_row2">
						<div class="horizontal-row-flex comment-toggle-box">
							<span class="task-active-assignation title-section-text">Комментарии</span>
							<div v-cloak class="toggle-switcher-box" @click="new_task.commentary = !new_task.commentary" :is_commentary_enabled=new_task.commentary>
								<div class="switcher-element">
									<div class="switcher-line"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div class="submition-container">
					<button v-if=new_task.title type="submit" @click=try_to_submit class="new-task-creation-submit">Сохранить</button> 
				</div>

				<!-- utilities -->

				<div v-cloak v-if=is_assignee_choosing_modal_active class="black-screen">
					<div class="assignee-selection-modal">
						<span class="assignee-selection-modal-title">Список достпуных исполнителей</span>
						<div class="assignee-list">
							<div @click=choose_assignee class="assignee-list-item" :user_id=profile.id v-for="profile in user_profiles">
								{{profile.second_name}} {{profile.first_name}} {{profile.patronymic}}
							</div>
						</div>
						<div class="exit-assignee" @click="is_assignee_choosing_modal_active=false">
							<span class="ex_1"></span>
							<span class="ex_2"></span>
						</div>
					</div>
				</div>
				
				<div v-if=show_response_text class="server-messages-box" @click=clear_message_box>
					<img :src="[response_status<=300 ? 'static/task_manager_static/img/good_response.svg' : 'static/task_manager_static/img/bad_response.svg']" alt="">
					<span>{{server_response_text}}</span>
				</div>
			</form>`,
		watch: {
			new_task: {
				handler: function() {
					if(!this.new_task.title || this.new_task.title.trim() == "") {
						this.task_title_class = "task-title task-empty";
						this.form_fields_validated[0] = 0;
					} else {
						this.task_title_class = "task-title";
						this.form_fields_validated[0] = 1;
					}

					if(!this.new_task.date_end.date || !this.new_task.date_end.time) {
						this.task_end_date_class = "date-input-item task-empty";
						this.form_fields_validated[1] = 0;
					} else {
						this.task_end_date_class = "date-input-item";
						this.form_fields_validated[1] = 1;
					}

					if(!this.new_task.assignee) {
						this.task_assignee_class = "task-assignation-box assignee-choosing task-empty";
						this.form_fields_validated[2] = 0;
					} else {
						this.task_assignee_class = "task-assignation-box assignee-choosing";
						this.form_fields_validated[2] = 1;
					}

					localStorage.setItem(this.$options.name + "_form_data", JSON.stringify(this.new_task));
				},
				deep: true
			},

			form_fields_validated: function() {
				if(this.form_fields_validated.reduce(function(p, a) {return p += a}) == 3) {
					this.submit_is_enabled = true;
				} else {
					this.submit_is_enabled = false;
				}
			},
		},
		methods: {
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
			remove_file_from_list: function(indexOfItem) {
				let deleting_item_index = -1;
				
				for(let i = 0; i < this.new_task.uploaded_files.length; i++) {
					if(this.new_task.uploaded_files[i].index == indexOfItem) {
						deleting_item_index = i;
						break;
					}
				}
				if(deleting_item_index > -1) {
					this.new_task.uploaded_files.splice(deleting_item_index, 1);
				}

			},
			clear_date: function() {
				this.new_task.date_begin = {
					date: "",
					time: ""
				};
				this.new_task.date_end = {
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
			select_option_item: function(e) {
				this.selected_style_object.background = e.currentTarget.getAttribute("name");
				this.selected_style_object.boxShadow = "none";
				this.new_task.status = e.currentTarget.textContent.replaceAll(/[\t\n]/g, "");
				this.current_status_option_item = this.new_task.status;
				this.is_popup_active = false;
			},
			pre_clear_form: function() {
				this.clear_confirm_class = this.clear_confirm_class == "clear-form-confirm" ? "clear-form-confirm clear-hidden" : "clear-form-confirm";
			},
			clear_form: function() {
				this.select_style_object = {
					background: "",
					boxShadow: "0 0 2px #000000",
				};
				this.current_status_option_item = null;
				this.new_task.status = null;
				this.new_task.title = "";
				this.new_task.description = null;
				this.new_task.assignee = null;
				this.clear_date();
				this.new_task.uploaded_files = [];
				this.choosen_assignee = "Выбрать исполнителя";
				this.clear_confirm_class = "clear-form-confirm clear-hidden";
				this.new_task.commentary = false;
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
			choose_assignee: function(e) {
				this.new_task.assignee = e.currentTarget.getAttribute("user_id");
				this.choosen_assignee = e.currentTarget.textContent.replaceAll(/[\t\n]/g, "");
				this.is_assignee_choosing_modal_active = false;
			},
			clear_message_box: function() {
				this.server_response_text = "";
				this.response_status = null;
				this.show_response_text = false;
			},
			try_to_submit: function(e) {
				e.preventDefault();
				let formData = new FormData();
				for(let i = 0; i < this.new_task.uploaded_files.length; i++) {
					formData.append(this.new_task.uploaded_files[i].file.name, this.new_task.uploaded_files[i].file)
				}
				formData.append('task', JSON.stringify(this.new_task));
				let current_component = this;
				axios.post("new_task_post", formData, {
					headers: {
						"X-CSRFToken": getCookie("csrftoken"),
						"Content-Type": "charset=utf-8"
					}
				}).then(function (response){
					if(response.status == 200) {
						if(response.data.task_created_id) {
							current_component.task_id_display = response.data.task_created_id;
							current_component.new_task.id = response.data.task_created_id;
						}
 					}
					current_component.server_response_text = response.data.message;
					current_component.response_status = response.status;
					current_component.show_response_text = true;
					setTimeout(function() {
						if(current_component.show_response_text == true) {
							current_component.clear_message_box();
						}
					}, 5000);
				})
			}
		}
	};
}