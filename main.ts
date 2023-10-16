import { 
	Plugin,
	App,
	PluginSettingTab,
	Setting,
	TFile
} from 'obsidian';

// ---------------------------- Storing Information ----------------------------
// This plugin will store a single string
interface EditorWidthSliderSettings {
	sliderPercentage: string;
	sliderWidth: string;
}
// the default value of the thing you want to store 
const DEFAULT_SETTINGS: EditorWidthSliderSettings = {
	sliderPercentage: '20',
	sliderWidth: '150'
}
// ---------------------------- Storing Information ----------------------------



// ---------------------------- Plugin Class -----------------------------------
export default class EditorWidthSlider extends Plugin {
	settings: EditorWidthSliderSettings;

	// most important function, this gets executed everytime the plugin is first 
	// loaded, e.g. when obsidian starts, or when the user just installed the 
	// plugin
	async onload() {
		await this.loadSettings();
		
		this.addStyle();

		this.createSlider();

		this.addSettingTab(new EditorWidthSliderSettingTab(this.app, this));

		this.addStyleFromYAML();
	}

	// async onLoadFile(file: TFile) {
	// 	console.log("test");
		

	// }

	onunload() {
		this.cleanUpResources();
	}

	addStyleFromYAML() {
		this.app.workspace.on('file-open', () => {
			// console.log("test");
			// if there is yaml frontmatter, take info from yaml, otherwise take info from slider
			const file = this.app.workspace.getActiveFile(); // Currently Open Note
			if(file.name) {
				const metadata = app.metadataCache.getFileCache(file);
				// const metadata = app.vault.metadataCache.getFileCache(file);
				if (metadata) {
					if (metadata.frontmatter)
						console.log(metadata.frontmatter);
					else
						console.log("no frontmatter available");
				}
			}
			// return; // Nothing Open
		})
	}
	
	// ---------------------------- SLIDER -------------------------------------
	createSlider() {

		// Create the slider element
		const slider = document.createElement('input');
		slider.classList.add('editor-width-slider');
		slider.type = 'range';
		slider.min = '0';
		slider.max = '100';
		slider.value = this.settings.sliderPercentage;
		// Adjust the width value as needed
		slider.style.width = this.settings.sliderWidth + 'px'; 
		
		// Add event listener to the slider
		slider.addEventListener('input', (event) => {
			const value = parseInt(slider.value);
			// const widthInPixels = 400 + value * 10;
			this.settings.sliderPercentage = value.toString();

			this.saveSettings();
			this.updateEditorStyle();
			sliderValueText.textContent = value.toString();
			console.log('Slider value:', value);
			// Perform any actions based on the slider value
		});

		// Create the text element for displaying the slider value
		const sliderValueText = document.createElement('span');
		sliderValueText.textContent = slider.value;
		sliderValueText.classList.add('editor-width-slider-value');
		sliderValueText.style.marginLeft = '5px';


		// Create the status bar item
		const statusBarItemEl = this.addStatusBarItem();
		// Append the slider to the status bar item
		statusBarItemEl.appendChild(slider);
		statusBarItemEl.appendChild(sliderValueText);
	}
	// ---------------------------- SLIDER -------------------------------------

	cleanUpResources() {
		this.resetEditorWidth();
	}

	resetEditorWidth() {
		const value = 0;
		// const widthInPixels = 400 + value * 10;
		this.settings.sliderPercentage = value.toString();

		this.saveSettings();
		this.updateEditorStyle();
	}

	// add the styling elements we need
	addStyle() {
		// add a css block for our settings-dependent styles
		const css = document.createElement('style');
		css.id = 'additional-editor-css';
		document.getElementsByTagName("head")[0].appendChild(css);

		// add the main class
		document.body.classList.add('additional-editor-css');

		// update the style with the settings-dependent styles
		this.updateEditorStyle();
	}

	
	// update the styles (at the start, or as the result of a settings change)
	updateEditorStyle() {
		// get the custom css element
		const styleElement = document.getElementById('additional-editor-css');
		if (!styleElement) throw "additional-editor-css element not found!";
		else {

		styleElement.innerText = `
			body {
			  	--file-line-width: calc(700px + 10 * ${this.settings.sliderPercentage}px) !important;
			}
		`;

		}
	}

	// update the styles (at the start, or as the result of a settings change)
	updateSliderStyle() {
		// get the custom css element
		const styleElements = document.getElementsByClassName('editor-width-slider');
		
		if (styleElements.length === 0) {
			throw new Error("editor-width-slider-value element not found!");
		} else {
			// Access the first element in the collection and modify its style
			const styleElement = styleElements[0] as HTMLElement;
			styleElement.style.width = this.settings.sliderWidth + 'px';
		}
	}


	// Method to load settings
	async loadSettings() {
		this.settings = Object.assign(
			{}, 
			DEFAULT_SETTINGS, 
			await this.loadData()
		);
	}

	// Method to store settings
	async saveSettings() {
		await this.saveData(this.settings);
	}

}
// ---------------------------- Plugin Class -----------------------------------

class EditorWidthSliderSettingTab extends PluginSettingTab {
	plugin: EditorWidthSlider;

	constructor(app: App, plugin: EditorWidthSlider) {
		super(app, plugin);
		this.plugin = plugin;
	}
	// this.settings.sliderWidth
	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Slider Width')
			.setDesc('How wide do you want your slider to be?')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.sliderWidth)
				.onChange(async (value) => {
					this.plugin.settings.sliderWidth = value;
					this.plugin.updateSliderStyle();
					await this.plugin.saveSettings();
				}));
	}
}